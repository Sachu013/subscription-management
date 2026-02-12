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

    const nextBilling = new Date(subscription.nextBillingDate);
    nextBilling.setHours(0, 0, 0, 0);

    let status;

    if (today < start) {
        status = "UPCOMING";
    }
    else if (today <= nextBilling) {
        status = "ACTIVE";
    }
    else {
        status = "EXPIRED";
    }

    // MANDATORY VERIFICATION LOG
    console.log(`--- [DEBUG] Subscription Status Calculation ---`);
    console.log(`Name: ${subscription.name}`);
    console.log(`Raw startDate: ${subscription.startDate}`);
    console.log(`Raw nextBillingDate: ${subscription.nextBillingDate}`);
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

    const nextBilling = new Date(subscription.nextBillingDate);
    if (isNaN(nextBilling.getTime())) return false;
    nextBilling.setHours(23, 59, 59, 999);

    // A subscription is active in that month IF:
    // It started before or during the month AND hasn't expired before the month started
    // Rule: Active if startDate <= monthEnd AND nextBillingDate >= monthStart
    return startDate <= monthEnd && nextBilling >= monthStart;
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

