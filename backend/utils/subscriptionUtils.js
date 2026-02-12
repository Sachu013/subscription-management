/**
 * Calculate subscription status based on payment history
 * @param {Object} subscription - Subscription object
 * @returns {string} - 'ACTIVE', 'EXPIRED', or 'UPCOMING'
 */
const getSubscriptionStatus = (subscription) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(subscription.startDate);
    start.setHours(0, 0, 0, 0);

    if (today < start) {
        return "UPCOMING";
    }

    if (!subscription.payments || subscription.payments.length === 0) {
        return "EXPIRED";
    }

    // Sort payments by date to find the latest
    const sortedPayments = [...subscription.payments].sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    const lastPayment = sortedPayments[0];
    const lastPaymentDate = new Date(lastPayment.paidOn);
    lastPaymentDate.setHours(0, 0, 0, 0);

    // Calculate expiration date based on cycle
    const expirationDate = new Date(lastPaymentDate);
    if (subscription.billingCycle.toLowerCase() === 'monthly') {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (subscription.billingCycle.toLowerCase() === 'yearly') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    if (today <= expirationDate) {
        return "ACTIVE";
    }

    return "EXPIRED";
};

/**
 * Calculate total amount spent from payments array
 * @param {Object} subscription - Subscription object
 * @returns {number} - Sum of all payments
 */
const getTotalAmountSpent = (subscription) => {
    if (!subscription.payments || subscription.payments.length === 0) {
        return 0;
    }
    return subscription.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
};

/**
 * Check if subscription was active/had payments in a specific month
 * @param {Object} subscription - Subscription object
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {boolean} - True if subscription had payments or covered this month
 */
/**
 * Calculate the next renewal date based on last payment
 * @param {Object} subscription - Subscription object
 * @returns {Date|null} - Next renewal date
 */
const getNextRenewalDate = (subscription) => {
    if (!subscription.payments || subscription.payments.length === 0) {
        return null;
    }

    const sortedPayments = [...subscription.payments].sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    const lastPayment = sortedPayments[0];
    const lastPaymentDate = new Date(lastPayment.paidOn);

    const nextRenewal = new Date(lastPaymentDate);
    if (subscription.billingCycle.toLowerCase() === 'monthly') {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    } else if (subscription.billingCycle.toLowerCase() === 'yearly') {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }

    return nextRenewal;
};

const isActiveInMonth = (subscription, month, year) => {
    // Current requirement focusing on payments: we can check if any payment falls in this month
    // OR if the subscription was "active" during any part of this month based on payments
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    if (!subscription.payments || subscription.payments.length === 0) return false;

    return subscription.payments.some(p => {
        const paidDate = new Date(p.paidOn);
        const cycleEnd = new Date(paidDate);
        if (subscription.billingCycle.toLowerCase() === 'monthly') {
            cycleEnd.setMonth(cycleEnd.getMonth() + 1);
        } else {
            cycleEnd.setFullYear(cycleEnd.getFullYear() + 1);
        }

        // Active in month if [paidDate, cycleEnd] overlaps [monthStart, monthEnd]
        return paidDate <= monthEnd && cycleEnd >= monthStart;
    });
};

/**
 * Get normalized monthly cost (Years -> Month conversion)
 * @param {Object} subscription - Subscription object
 * @returns {number} - Cost per month
 */
const getNormalizedMonthlyCost = (subscription) => {
    const price = subscription.price || 0;
    if (subscription.billingCycle && subscription.billingCycle.toLowerCase() === 'yearly') {
        return price / 12;
    }
    return price;
};

module.exports = {
    getSubscriptionStatus,
    getTotalAmountSpent,
    isActiveInMonth,
    getNormalizedMonthlyCost,
    getNextRenewalDate
};


