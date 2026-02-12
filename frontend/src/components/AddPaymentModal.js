import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddPaymentModal = ({ subscription, onClose, onConfirm }) => {
    const [paidOn, setPaidOn] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(subscription.price);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(subscription._id, { paidOn, amount });
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="modal-content" style={{
                background: '#1a1a1a',
                padding: '30px',
                borderRadius: '15px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Add Payment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>
                        <FaTimes />
                    </button>
                </div>

                <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
                    Recording payment for <strong>{subscription.name}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#eee', fontSize: '14px' }}>Payment Date</label>
                        <input
                            type="date"
                            value={paidOn}
                            onChange={(e) => setPaidOn(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#eee', fontSize: '14px' }}>Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            step="0.01"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 2,
                                padding: '12px',
                                background: 'linear-gradient(135deg, #43e97b 0%, #38ef7d 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
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
