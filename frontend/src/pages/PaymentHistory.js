import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import subscriptionService from '../services/subscriptionService';

import Spinner from '../components/Spinner';
import { FaArrowLeft, FaDownload, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'Online',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser?.token;
                if (token) {
                    const [sub, pay] = await Promise.all([
                        subscriptionService.getSubscriptionById(id, token),
                        paymentService.getPaymentsBySubscription(id, token)
                    ]);
                    setSubscription(sub);
                    setPayments(pay);
                }
            } catch (error) {
                toast.error('Error fetching payment history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleExport = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const blob = await paymentService.exportPaymentsCSV(id, storedUser.token);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${subscription.name}_payments.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleDelete = async (paymentId) => {
        if (window.confirm('Delete this payment record?')) {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                await paymentService.deletePayment(paymentId, storedUser.token);
                setPayments(payments.filter(p => p._id !== paymentId));
                toast.success('Payment deleted');
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (editingPayment) {
                const updated = await paymentService.updatePayment(editingPayment._id, formData, storedUser.token);
                setPayments(payments.map(p => p._id === updated._id ? updated : p));
                toast.success('Payment updated');
            } else {
                const added = await paymentService.addPayment({ ...formData, subscriptionId: id }, storedUser.token);
                setPayments([added, ...payments]);
                toast.success('Payment added');
            }
            setShowModal(false);
            setEditingPayment(null);
            setFormData({ amount: '', paymentDate: new Date().toISOString().split('T')[0], method: 'Online', notes: '' });
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const openEdit = (payment) => {
        setEditingPayment(payment);
        setFormData({
            amount: payment.amount,
            paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
            method: payment.method || 'Online',
            notes: payment.notes || ''
        });
        setShowModal(true);
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="dashboard" style={{ padding: '0', color: 'var(--text-primary)' }}>
            <header className="header-responsive" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            background: 'var(--background)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: 'var(--primary)' }}>History</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleExport} className="btn btn-secondary nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaDownload /> Export
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPlus /> <span className="nav-desktop">Add Payment</span>
                    </button>
                </div>
            </header>

            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)'
            }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', color: 'var(--text-primary)' }}>
                            <th style={{ padding: '10px 18px' }}>Date</th>
                            <th style={{ padding: '10px 18px' }}>Amount</th>
                            <th style={{ padding: '10px 18px' }}>Method</th>
                            <th style={{ padding: '10px 18px' }}>Notes</th>
                            <th style={{ padding: '10px 18px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No payment records found</td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px' }} data-label="Date">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--primary)' }} data-label="Amount">₹{p.amount}</td>
                                    <td style={{ padding: '16px' }} data-label="Method">
                                        <span style={{
                                            background: 'var(--background)',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {p.method}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }} data-label="Notes">{p.notes || '-'}</td>
                                    <td style={{ padding: '16px', display: 'flex', gap: '15px' }} data-label="Actions">
                                        <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', fontSize: '1.1rem', padding: '10px' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem', padding: '10px' }}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="form" style={{ width: '400px', background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '25px' }}>{editingPayment ? 'Edit' : 'Add'} Payment</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Method</label>
                                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                                    <option value="Online">Online</option>
                                    <option value="Card">Card</option>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-block">{editingPayment ? 'Update' : 'Add'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-block btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
