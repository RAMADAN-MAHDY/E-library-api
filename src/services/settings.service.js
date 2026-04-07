import Settings from '../models/Settings.js';

/**
 * Get global settings. Creates dummy settings if none exist.
 */
export const getSettings = async () => {
    let settings = await Settings.findOne();
    
    if (!settings) {
        // Create empty object to trigger schema defaults
        settings = await Settings.create({});
    }
    
    return settings;
};

/**
 * Update global settings.
 * @param {Object} updateData Data to update
 */
export const updateSettings = async (updateData) => {
    let settings = await Settings.findOne();
    
    if (!settings) {
        settings = await Settings.create(updateData);
    } else {
        Object.assign(settings, updateData);
        await settings.save();
    }
    
    return settings;
};
