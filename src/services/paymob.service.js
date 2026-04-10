// src/services/paymob.service.js
import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env.js';

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

/**
 * Security: Verify Paymob HMAC Signature
 */
export const verifyPaymobHMAC = (query) => {
  const hmacProps = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];

  const message = hmacProps
    .map((key) => {
      // 1. البحث عن المفتاح مباشرة (مهم لروابط الـ GET Callback)
      if (query[key] !== undefined) {
        return String(query[key]);
      }

      // 2. البحث المتداخل (مهم للـ POST Webhooks)
      let value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), query);

      // 3. حالة خاصة لحقل order.id في روابط الـ GET يسمى order فقط
      if (key === 'order.id' && (value === '' || value === undefined)) {
        value = query.order;
      }

      return (value !== undefined && value !== null) ? String(value) : '';
    })
    .join('');

  const secret = env.PAYMOB_HMAC_SECRET;
  const hash = crypto.createHmac('sha512', secret).update(message).digest('hex');

  return hash === query.hmac;
};


/**
 * Step 1: Authentication
 * @returns {Promise<string>} auth_token
 */
const authenticate = async () => {
  const response = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
    api_key: env.PAYMOB_API_KEY,
  });
  return response.data.token;
};

/**
 * Step 2: Order Registration
 * @param {string} token auth_token
 * @param {number} amount_cents 
 * @param {string} currency 
 * @returns {Promise<number>} order_id
 */
const registerOrder = async (token, amount_cents, currency) => {
  const response = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    auth_token: token,
    delivery_needed: 'false',
    amount_cents: String(amount_cents),
    currency,
    items: [],
  });
  return response.data.id;
};

/**
 * Step 3: Payment Key Request
 * @param {string} token auth_token
 * @param {number} order_id 
 * @param {number} amount_cents 
 * @param {string} currency 
 * @param {object} userData { name, email, phone }
 */
const getPaymentKey = async (token, order_id, amount_cents, currency, userData) => {
  const [firstName, ...lastNameParts] = userData.name.split(' ');
  const lastName = lastNameParts.join(' ') || 'User';

  const integrationId = userData.paymentMethod === 'wallet'
    ? env.PAYMOB_WALLET_INTEGRATION_ID
    : env.PAYMOB_CARD_INTEGRATION_ID;

  const parsedIntegrationId = Number(integrationId);

  // Guard: catch misconfigured env vars BEFORE calling Paymob
  if (!parsedIntegrationId || isNaN(parsedIntegrationId)) {
    throw new Error(
      `[Paymob Config] integration_id is invalid ("${integrationId}") for method "${userData.paymentMethod}". ` +
      `Check PAYMOB_CARD_INTEGRATION_ID / PAYMOB_WALLET_INTEGRATION_ID in your .env — remove any surrounding quotes or spaces.`
    );
  }

  console.log(`🔑 [Paymob] Requesting Payment Key for "${userData.paymentMethod}" using integration_id: ${parsedIntegrationId}`);

  const phone = (userData.phone || '01000000000').replace(/\s/g, '').replace(/^\+2/, '');

  const response = await axios.post(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    auth_token: token,
    amount_cents: String(amount_cents),
    expiration: 3600, // 1 hour
    order_id: String(order_id),
    billing_data: {
      apartment: 'NA',
      email: userData.email,
      floor: 'NA',
      first_name: firstName || 'Customer',
      street: 'NA',
      building: 'NA',
      phone_number: phone,
      shipping_method: 'NA',
      postal_code: 'NA',
      city: 'NA',
      country: 'EG',
      last_name: lastName,
      state: 'NA',
    },
    currency,
    redirection_url: `${env.FRONTEND_URL}/payment-status`,
    integration_id: parsedIntegrationId,
  });
  return response.data.token;
};

/**
 * Step 4: Pay with Wallet (Optional, only for Wallets)
 * @param {string} payment_token 
 * @param {string} phone 
 * @returns {Promise<string>} redirect_url
 */
const payWithWallet = async (payment_token, phone) => {
  const response = await axios.post(`${PAYMOB_BASE_URL}/acceptance/payments/pay`, {
    source: {
      identifier: phone,
      subtype: "WALLET"
    },
    payment_token: payment_token
  });
  // This is the URL that handles the wallet redirection
  return response.data.iframe_redirection_url || response.data.redirect_url;
};

/**
 * Full Flow to get Payment Link
 */
export const createPaymentLink = async (amount_cents, currency, userData) => {
  try {
    const auth_token = await authenticate();
    const order_id = await registerOrder(auth_token, amount_cents, currency);
    const payment_key = await getPaymentKey(auth_token, order_id, amount_cents, currency, userData);

    // 🏦 Wallet Flow
    if (userData.paymentMethod === 'wallet') {
      const phone = userData.phone || '';
      const cleanPhone = phone.replace(/\s/g, '').replace(/^\+2/, '');

      if (!cleanPhone || cleanPhone.length < 10) {
        throw new Error('رقم المحفظة غير صالح. يرجى إدخال رقم هاتف مصري صحيح (10 أرقام على الأقل).');
      }

      console.log(`📱 [Paymob] Attempting Wallet Flow for: ${cleanPhone}`);

      // ❌ No silent fallback: if wallet fails, we throw so the user knows
      const walletUrl = await payWithWallet(payment_key, cleanPhone);

      if (!walletUrl) {
        throw new Error('لم يتم استلام رابط المحفظة من باي موب. تحقق من integration_id المحفظة.');
      }

      console.log('✅ [Paymob] Wallet URL received successfully.');
      return {
        link: walletUrl,
        orderId: order_id,
        paymentMethodUsed: 'wallet',
      };
    }

    // 💳 Card Iframe Flow
    const iframeLink = `https://accept.paymob.com/api/acceptance/iframes/${env.PAYMOB_IFRAME_ID}?payment_token=${payment_key}`;
    console.log('🌐 [Paymob] Returning Card Iframe link.');

    return {
      link: iframeLink,
      orderId: order_id,
      paymentMethodUsed: 'card',
    };
  } catch (err) {
    const errorBody = err.response?.data;
    console.error('🚨 [Paymob Critical Error]:', JSON.stringify(errorBody || err.message));

    // If it's already a clean Error (thrown above), re-throw it as-is
    if (!errorBody) throw err;

    const detail = typeof errorBody === 'object'
      ? (errorBody.message || errorBody.detail || errorBody.error_message || JSON.stringify(errorBody))
      : String(errorBody);

    throw new Error(`Paymob: ${detail}`);
  }
};
