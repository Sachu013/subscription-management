import React from 'react';

const SubscriptionItem = ({ subscription, onDelete, onEdit, onPay }) => {
    const getLifecycleStatus = () => {
        const { status } = subscription;

        if (status === 'Upcoming') {
            return { label: 'Upcoming', color: '#ffc107', icon: '🟡' };
        }

        if (status === 'Expired') {
            return { label: 'Expired', color: '#ff4d4d', icon: '🔴' };
        }

        return { label: 'Active', color: '#43e97b', icon: '🟢' };
    };

    const lifecycle = getLifecycleStatus();

    return (
        <div className="subscription-item" style={{
            position: 'relative',
            border: `1px solid rgba(255, 255, 255, 0.2)`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{subscription.name}</h3>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 10px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${lifecycle.color}`,
                }}>
                    <span style={{ fontSize: '10px' }}>{lifecycle.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: lifecycle.color }}>{lifecycle.label}</span>
                </div>
            </div>

            <p style={{ margin: '5px 0' }}>Category: {subscription.category || 'N/A'}</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0', color: '#43e97b' }}>
                ₹{subscription.price} <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 'normal' }}>/ {subscription.billingCycle}</span>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', margin: '10px 0' }}>
                <p style={{ fontSize: '13px', margin: '0' }}>Total Spent: <strong>₹{subscription.totalAmountSpent || 0}</strong></p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>
                    Last Payment: {subscription.payments && subscription.payments.length > 0
                        ? new Date(subscription.payments.sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))[0].paidOn).toLocaleDateString()
                        : 'None'}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    onClick={() => onPay(subscription._id)}
                    style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #43e97b 0%, #38ef7d 100%)',
                        color: '#000',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Add Payment
                </button>
                <button onClick={() => onEdit(subscription)} style={{ padding: '8px 12px' }}>Edit</button>
                <button onClick={() => onDelete(subscription._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '8px 12px' }}>Delete</button>
            </div>
        </div>
    );
};

export default SubscriptionItem;
