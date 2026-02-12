/**
 * Calculate subscription status based on dates
 * @param {Object} subscription - Subscription object
 * @returns {string} - 'ACTIVE', 'EXPIRED', or 'UPCOMING'
 */
const getSubscriptionStatus = (subscription) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(subscription.startDate);
    start.setHours(0, 0, 0, 0);

    const end = subscription.endDate
        ? new Date(subscription.endDate)
        : null;

    if (end) end.setHours(0, 0, 0, 0);

    let status;

    if (start > today) {
        status = "UPCOMING";
    }
    else if (end && end < today) {
        status = "EXPIRED";
    }
    else {
        status = "ACTIVE";
    }

    // MANDATORY VERIFICATION LOG
    console.log(`--- [DEBUG] Subscription: ${subscription.name} ---`);
    console.log(`Raw startDate: ${subscription.startDate} (${typeof subscription.startDate})`);
    console.log(`Raw endDate: ${subscription.endDate} (${typeof subscription.endDate})`);
    console.log(`Processed start: ${start.toISOString()}`);
    console.log(`Processed end: ${end ? end.toISOString() : 'NULL'}`);
    console.log(`Today: ${today.toISOString()}`);
    console.log(`Computed Status: ${status}`);
    console.log('-------------------------------------------');

    return status;
};

/**
 * Check if subscription is active in a specific month
 * @param {Object} subscription - Subscription object
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {boolean} - True if active in the month
 */
const isActiveInMonth = (subscription, month, year) => {
    const monthStart = new Date(year, month, 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(year, month + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const startDate = new Date(subscription.startDate);
    if (isNaN(startDate.getTime())) return false;
    startDate.setHours(0, 0, 0, 0);

    let endDate = null;
    if (subscription.endDate) {
        endDate = new Date(subscription.endDate);
        if (isNaN(endDate.getTime())) {
            endDate = null;
        } else {
            endDate.setHours(23, 59, 59, 999);
        }
    }

    // A subscription is active in that month IF:
    // startDate <= monthEnd AND (endDate is NULL OR endDate >= monthStart)
    return startDate <= monthEnd && (endDate === null || endDate >= monthStart);
};

/**
 * Get normalized monthly cost
 * @param {Object} subscription - Subscription object
 * @returns {number} - Normalized monthly cost
 */
const getNormalizedMonthlyCost = (subscription) => {
    const cost = subscription.cost || 0;
    if (subscription.billingCycle === 'Monthly') {
        return cost;
    } else if (subscription.billingCycle === 'Yearly') {
        return cost / 12;
    } else if (subscription.billingCycle === 'Weekly') {
        return cost * 4;
    }
    return cost;
};

module.exports = {
    getSubscriptionStatus,
    isActiveInMonth,
    getNormalizedMonthlyCost
};
