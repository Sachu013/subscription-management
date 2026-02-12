import React from 'react';
import { FaBell } from 'react-icons/fa';

const SubscriptionItem = ({ subscription, onDelete, onEdit }) => {
    // Calculate if subscription is expiring soon
    const isExpiringSoon = () => {
        if (!subscription.reminderEnabled || !subscription.nextBillingDate) return false;

        const today = new Date();
        const nextBilling = new Date(subscription.nextBillingDate);
        const daysUntilRenewal = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));

        return daysUntilRenewal <= subscription.reminderDays && daysUntilRenewal >= 0;
    };

    const getLifecycleStatus = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const startDate = new Date(subscription.startDate);
        startDate.setHours(0, 0, 0, 0);

        // 1. Upcoming (not started)
        if (now < startDate) return { label: 'Upcoming', color: '#ffc107', icon: '🟡' };

        // 2. Expired
        if (subscription.endDate) {
            const endDate = new Date(subscription.endDate);
            endDate.setHours(0, 0, 0, 0);
            if (now > endDate) return { label: 'Expired', color: '#ff4d4d', icon: '🔴' };
        }

        // 3. Upcoming (due soon - 7 days)
        if (subscription.nextBillingDate) {
            const nextBilling = new Date(subscription.nextBillingDate);
            nextBilling.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((nextBilling - now) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) return { label: 'Upcoming', color: '#ffc107', icon: '🟡' };
        }

        return { label: 'Active', color: '#43e97b', icon: '🟢' };
    };

    const lifecycle = getLifecycleStatus();
    const getDaysUntilRenewal = () => {
        if (!subscription.nextBillingDate) return null;
        const today = new Date();
        const nextBilling = new Date(subscription.nextBillingDate);
        return Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));
    };

    const expiring = isExpiringSoon();
    const daysLeft = getDaysUntilRenewal();

    return (
        <div className="subscription-item" style={{
            position: 'relative',
            border: expiring ? '2px solid #ff9800' : '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            {expiring && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ff9800',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    <FaBell />
                    {daysLeft === 0 ? 'Due Today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                </div>
            )}
            <h3>{subscription.name}</h3>
            <p>Category: {subscription.category || 'N/A'}</p>
            <p>Cost: ₹{subscription.cost}</p>
            <p>Billing Cycle: {subscription.billingCycle}</p>
            <p>Next Due: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
            {subscription.reminderEnabled && (
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    🔔 Reminder: {subscription.reminderDays} days before
                </p>
            )}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: `1px solid ${lifecycle.color}`,
                margin: '10px 0'
            }}>
                <span style={{ fontSize: '10px' }}>{lifecycle.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: lifecycle.color }}>{lifecycle.label}</span>
            </div>
            <div style={{ marginTop: '10px' }}>
                <button onClick={() => onEdit(subscription)} style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => onDelete(subscription._id)} style={{ backgroundColor: '#ff4d4d', color: 'white' }}>Delete</button>
            </div>
        </div>
    );
};

export default SubscriptionItem;
