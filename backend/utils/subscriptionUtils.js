/**
 * Helper to add a billing cycle to a date
 */
const addCycle = (date, cycle) => {
    const d = new Date(date);
    const normalizedCycle = cycle ? cycle.toLowerCase() : 'monthly';

    if (normalizedCycle === 'monthly') {
        d.setMonth(d.getMonth() + 1);
    } else if (normalizedCycle === 'yearly') {
        d.setFullYear(d.getFullYear() + 1);
    }
    return d;
};

/**
 * Calculate subscription status dynamically
 */
const getSubscriptionStatus = (sub) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(sub.startDate);
    start.setHours(0, 0, 0, 0);

    // 1. Upcoming if today < startDate
    if (today < start) {
        return "Upcoming";
    }

    const payments = sub.payments || [];

    // 2. Expired if no payments exist AND today > startDate + 1 billing cycle
    if (payments.length === 0) {
        const firstDue = addCycle(start, sub.billingCycle);
        if (today > firstDue) return "Expired";
        return "Active"; // Within the first grace period
    }

    // 3. Sort payments by date to find the latest
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    const lastPaymentDate = new Date(sortedPayments[0].paidOn);
    lastPaymentDate.setHours(0, 0, 0, 0);

    const nextDue = addCycle(lastPaymentDate, sub.billingCycle);
    nextDue.setHours(0, 0, 0, 0);

    // 4. Active if latest payment + billing cycle >= today
    if (today <= nextDue) {
        return "Active";
    }

    return "Expired";
};

/**
 * Calculate total amount spent from payments array
 */
const getTotalAmountSpent = (sub) => {
    const payments = sub.payments || [];
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return parseFloat(total.toFixed(2));
};

/**
 * Get the very last payment date
 */
const getLastPaymentDate = (sub) => {
    const payments = sub.payments || [];
    if (payments.length === 0) return null;
    const sorted = [...payments].sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    return sorted[0].paidOn;
};

/**
 * Get the next due date
 */
const getNextDueDate = (sub) => {
    const start = new Date(sub.startDate);
    const payments = sub.payments || [];

    if (payments.length === 0) {
        return addCycle(start, sub.billingCycle);
    }

    const sorted = [...payments].sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    return addCycle(new Date(sorted[0].paidOn), sub.billingCycle);
};

/**
 * Check if the subscription had any payment in a specific month
 */
const isActiveInMonth = (sub, month, year) => {
    if (!sub.payments) return false;
    return sub.payments.some(p => {
        const pDate = new Date(p.paidOn);
        return pDate.getMonth() === month && pDate.getFullYear() === year;
    });
};

/**
 * Get monthly normalized cost for comparison
 */
const getNormalizedMonthlyCost = (sub) => {
    const price = sub.price !== undefined ? sub.price : (sub.cost !== undefined ? sub.cost : 0);
    const cycle = sub.billingCycle ? sub.billingCycle.toLowerCase() : 'monthly';

    if (cycle === 'monthly') return price;
    if (cycle === 'yearly') return price / 12;
    return price;
};

module.exports = {
    getSubscriptionStatus,
    getTotalAmountSpent,
    getLastPaymentDate,
    getNextDueDate,
    isActiveInMonth,
    getNormalizedMonthlyCost
};


