import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddPaymentModal = ({ subscription, onClose, onConfirm }) => {
    const [paidOn, setPaidOn] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(subscription.price);
    const [method, setMethod] = useState('Online');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(subscription._id, { paidOn, amount, method, notes });
        setLoading(false);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content" style={{
                background: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Add Payment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}>
                        <FaTimes />
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px' }}>
                    Recording payment for <strong>{subscription.name}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={paidOn}
                                onChange={(e) => setPaidOn(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            required
                        >
                            <option value="Online">Online</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Auto-Debit">Auto-Debit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add payment notes..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--background)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                minHeight: '80px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{ flex: 2 }}
                        >
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
