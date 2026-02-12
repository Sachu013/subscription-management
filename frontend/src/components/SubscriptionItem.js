import React from 'react';

const SubscriptionItem = ({ subscription, onDelete, onEdit, onPay }) => {
    const getLifecycleStatus = () => {
        const { status } = subscription;

        if (status === 'Paused') {
            return { label: 'Paused', color: '#888', icon: '⏸️' };
        }

        if (status === 'Upcoming') {
            return { label: 'Upcoming', color: '#ffc107', icon: '🟡' };
        }

        if (status === 'Expired') {
            return { label: 'Expired', color: '#ff4d4d', icon: '🔴' };
        }

        return { label: 'Active', color: '#43e97b', icon: '🟢' };
    };

    const getDueIndicator = () => {
        if (!subscription.nextRenewalDate || subscription.status === 'Paused') return null;

        const nextDue = new Date(subscription.nextRenewalDate);
        nextDue.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = nextDue.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let label = '';
        let color = '#43e97b';

        if (diffDays < 0) {
            label = `Overdue by ${Math.abs(diffDays)}d`;
            color = '#ff4d4d';
        } else if (diffDays === 0) {
            label = 'Due Today';
            color = '#ff4d4d';
        } else if (diffDays === 1) {
            label = 'Due Tomorrow';
            color = '#ff9800';
        } else if (diffDays <= 4) {
            label = `Due in ${diffDays}d`;
            color = '#ff9800';
        } else {
            label = `Next: ${nextDue.toLocaleDateString()}`;
            color = '#43e97b';
        }

        return { label, color, diffDays };
    };

    const lifecycle = getLifecycleStatus();
    const dueInfo = getDueIndicator();

    return (
        <div className="subscription-item" style={{
            position: 'relative',
            border: `1px solid rgba(255, 255, 255, 0.2)`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{subscription.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '5px' }}>
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
                    {dueInfo && (
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#fff',
                            background: dueInfo.color,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            opacity: 0.9
                        }}>
                            {dueInfo.label}
                        </div>
                    )}
                </div>
            </div>

            <p style={{ margin: '5px 0' }}>Category: {subscription.category || 'N/A'}</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0', color: '#43e97b' }}>
                ₹{subscription.price} <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 'normal' }}>/ {subscription.billingCycle}</span>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', margin: '10px 0' }}>
                <p style={{ fontSize: '13px', margin: '0' }}>Total Spent: <strong>₹{subscription.totalAmountSpent || 0}</strong></p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Last: {subscription.payments && subscription.payments.length > 0
                        ? new Date(subscription.payments.sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))[0].paidOn).toLocaleDateString()
                        : 'None'}</span>
                    <a href={`/subscriptions/${subscription._id}/payments`} style={{ color: '#43e97b', textDecoration: 'none', fontWeight: 'bold' }}>View History</a>
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
                <button
                    onClick={() => onPause(subscription)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: subscription.status === 'Paused' ? '#43e97b' : '#666',
                        color: subscription.status === 'Paused' ? '#000' : '#fff'
                    }}
                >
                    {subscription.status === 'Paused' ? 'Resume' : 'Pause'}
                </button>
                <button onClick={() => onEdit(subscription)} style={{ padding: '8px 12px' }}>Edit</button>
                <button onClick={() => onDelete(subscription._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '8px 12px' }}>Delete</button>
            </div>
        </div>
    );
};

export default SubscriptionItem;
