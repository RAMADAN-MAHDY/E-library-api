import Payment from '../models/Payment.js';
import User from '../models/User.js';
import File from '../models/File.js';

/**
 * KPI Summary for Admin Dashboard
 */
export const getDashboardSummary = async () => {
  const [revenue, totalUsers, totalFiles, lastSales] = await Promise.all([
    // Total Revenue (Cents to unit)
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    // User Count
    User.countDocuments({ role: 'user' }),
    // Book Count
    File.countDocuments(),
    // Last 5 successful sales
    Payment.find({ status: 'succeeded' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('book', 'title')
  ]);

  return {
    totalRevenue: revenue[0]?.total || 0,
    totalUsers,
    totalFiles,
    recentSales: lastSales.map(s => ({
      userName: s.user?.name,
      bookTitle: s.book?.title,
      amount: s.amount,
      date: s.createdAt
    }))
  };
};

/**
 * User Growth & Conversion Analytics
 */
export const getUserAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [total, newUsers, buyers] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
    // Distinct users who have at least one successful payment
    Payment.distinct('user', { status: 'succeeded' })
  ]);

  return {
    totalUsers: total,
    newUsersLast30Days: newUsers,
    payingCustomersCount: buyers.length,
    conversionRate: total > 0 ? ((buyers.length / total) * 100).toFixed(2) + '%' : '0%'
  };
};

/**
 * Revenue Breakdown (Daily/Monthly)
 */
export const getRevenueStats = async () => {
  const currentYear = new Date().getFullYear();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [overall, monthly, daily] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          createdAt: { $gte: new Date(`${currentYear}-01-01`) }
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]),
    Payment.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    summary: overall[0] || { total: 0, count: 0 },
    monthly: monthly.map(m => ({ month: m._id.month, total: m.total, count: m.count })),
    daily: daily.map(d => ({ date: d._id, total: d.total, count: d.count }))
  };
};

/**
 * Best Selling Products
 */
export const getTopSellingBooks = async (limit = 10) => {
  const topBooks = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: '$book', salesCount: { $sum: 1 }, revenue: { $sum: '$amount' } } },
    { $sort: { salesCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'files',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' },
    {
      $project: {
        _id: 1,
        salesCount: 1,
        revenue: 1,
        title: '$bookDetails.title',
        price: '$bookDetails.price'
      }
    }
  ]);
  return topBooks;
};

/**
 * Advanced Business Intelligence (BI) Analytics
 */
export const getAdvancedBIStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [categoryStats, aov, stagnant, signups] = await Promise.all([
    // 1. Category Performance (Most Rev. per Category)
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $lookup: {
          from: 'files',
          localField: 'book',
          foreignField: '_id',
          as: 'bookInfo'
        }
      },
      { $unwind: '$bookInfo' },
      {
        $group: {
          _id: '$bookInfo.category',
          totalRevenue: { $sum: '$amount' },
          booksSold: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'catName'
        }
      },
      { $unwind: '$catName' },
      { $project: { category: '$catName.name', totalRevenue: 1, booksSold: 1 } },
      { $sort: { totalRevenue: -1 } }
    ]),
    // 2. Average Order Value (AOV)
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$amount' },
          totalRev: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    // 3. Stagnant Books (Files created >30 days ago with 0 sales)
    // First get all sold book IDs
    Payment.distinct('book', { status: 'succeeded' }).then(soldIds => {
      return File.find({
        _id: { $nin: soldIds },
        createdAt: { $lt: thirtyDaysAgo }
      }).limit(10).select('title createdAt price');
    }),
    // 4. Signup Methods (Google vs Local)
    User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: null,
          google: { $sum: { $cond: [{ $ifNull: ['$googleId', false] }, 1, 0] } },
          local: { $sum: { $cond: [{ $ifNull: ['$googleId', false] }, 0, 1] } }
        }
      }
    ])
  ]);

  return {
    categoryPerformance: categoryStats,
    aov: {
      averageCents: Math.round(aov[0]?.avg || 0),
      totalRevenueCents: aov[0]?.totalRev || 0,
      orderCount: aov[0]?.count || 0
    },
    stagnantBooks: stagnant,
    signupChannels: {
      google: signups[0]?.google || 0,
      local: signups[0]?.local || 0
    }
  };
};
