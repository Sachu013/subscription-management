import React from 'react';

const SubscriptionItem = ({ subscription, onDelete, onEdit, onPay, onPause }) => {
    const getLifecycleStatus = () => {
        const { status } = subscription;

        if (status === 'Paused') {
            return { label: 'Paused', color: 'var(--text-secondary)', icon: '⏸️' };
        }

        if (status === 'Upcoming') {
            return { label: 'Upcoming', color: '#ff9800', icon: '🟡' };
        }

        if (status === 'Expired') {
            return { label: 'Expired', color: 'var(--danger)', icon: '🔴' };
        }

        return { label: 'Active', color: 'var(--primary)', icon: '🟢' };
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
        let color = 'var(--primary)';

        if (diffDays < 0) {
            label = `Overdue by ${Math.abs(diffDays)}d`;
            color = 'var(--danger)';
        } else if (diffDays === 0) {
            label = 'Due Today';
            color = 'var(--danger)';
        } else if (diffDays === 1) {
            label = 'Due Tomorrow';
            color = '#ff9800';
        } else if (diffDays <= 4) {
            label = `Due in ${diffDays}d`;
            color = '#ff9800';
        } else {
            label = `Next: ${nextDue.toLocaleDateString()}`;
            color = 'var(--primary)';
        }

        return { label, color, diffDays };
    };

    const lifecycle = getLifecycleStatus();
    const dueInfo = getDueIndicator();

    return (
        <div className="subscription-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{subscription.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '5px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'var(--background)',
                        border: `1px solid var(--border-color)`,
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
                            padding: '3px 8px',
                            borderRadius: '6px',
                        }}>
                            {dueInfo.label}
                        </div>
                    )}
                </div>
            </div>

            <p style={{ margin: '10px 0', fontSize: '13px' }}>Category: {subscription.category || 'N/A'}</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '15px 0', color: 'var(--primary)' }}>
                ₹{subscription.price} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {subscription.billingCycle}</span>
            </p>

            <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '12px', margin: '15px 0', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '13px', margin: '0', color: 'var(--text-primary)' }}>Total Spent: <strong>₹{subscription.totalAmountSpent || 0}</strong></p>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Last: {subscription.payments && subscription.payments.length > 0
                        ? new Date(subscription.payments.sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))[0].paidOn).toLocaleDateString()
                        : 'None'}</span>
                    <a href={`/subscriptions/${subscription._id}/payments`} className="link-hover" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>View History</a>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(var(--btn-cols, 3), 1fr)',
                gap: '8px',
                marginTop: 'auto',
                '--btn-cols': window.innerWidth < 450 ? 1 : 3
            }}>
                <button
                    onClick={() => onPay(subscription._id)}
                    className="btn"
                    style={{
                        gridColumn: '1 / -1',
                        padding: '12px',
                        marginBottom: '4px'
                    }}
                >
                    Add Payment
                </button>
                <button
                    onClick={() => onPause(subscription)}
                    className="btn btn-secondary"
                    style={{
                        padding: '10px',
                        fontSize: '13px'
                    }}
                >
                    {subscription.status === 'Paused' ? 'Resume' : 'Pause'}
                </button>
                <button
                    onClick={() => onEdit(subscription)}
                    className="btn"
                    style={{
                        padding: '10px',
                        fontSize: '13px',
                        background: 'var(--background)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(subscription._id)}
                    className="btn btn-danger"
                    style={{
                        padding: '10px',
                        fontSize: '13px'
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default SubscriptionItem;
