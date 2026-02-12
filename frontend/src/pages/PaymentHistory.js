import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import subscriptionService from '../services/subscriptionService';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { FaArrowLeft, FaDownload, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

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
        <div style={{ padding: '30px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn" style={{ borderRadius: '50%', padding: '10px' }}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0 }}>{subscription?.name} Payment History</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleExport} className="btn" style={{ background: '#007bff' }}>
                        <FaDownload /> Export CSV
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn" style={{ background: '#43e97b', color: '#000' }}>
                        <FaPlus /> Add Payment
                    </button>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(67, 233, 123, 0.1)', color: '#43e97b' }}>
                            <th style={{ padding: '15px' }}>Date</th>
                            <th style={{ padding: '15px' }}>Amount</th>
                            <th style={{ padding: '15px' }}>Method</th>
                            <th style={{ padding: '15px' }}>Notes</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No payment records found</td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{p.amount}</td>
                                    <td style={{ padding: '15px' }}>{p.method}</td>
                                    <td style={{ padding: '15px', fontSize: '13px', opacity: 0.8 }}>{p.notes || '-'}</td>
                                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                        <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', color: '#ffc107', cursor: 'pointer' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><FaTrash /></button>
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
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001
                }}>
                    <div className="form" style={{ width: '400px', background: '#1a1a1a', padding: '30px', borderRadius: '15px' }}>
                        <h2>{editingPayment ? 'Edit' : 'Add'} Payment</h2>
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
                                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-block">{editingPayment ? 'Update' : 'Add'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-block" style={{ background: '#333' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
