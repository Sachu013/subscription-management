import React, { useState, useEffect } from 'react';

const SubscriptionForm = ({ onFormSubmit, initialData = {}, isEditMode = false, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Other',
        cost: '',
        currency: 'INR',
        startDate: '',
        billingCycle: 'Monthly',
        nextBillingDate: '',
        endDate: '',
        status: 'Active',
        reminderEnabled: false,
        reminderDays: 7
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            // Format dates to YYYY-MM-DD for input fields if they exist
            const formattedStart = initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '';
            const formattedNext = initialData.nextBillingDate ? new Date(initialData.nextBillingDate).toISOString().split('T')[0] : '';
            const formattedEnd = initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '';

            setFormData({
                ...initialData,
                startDate: formattedStart,
                nextBillingDate: formattedNext,
                endDate: formattedEnd || '',
                status: initialData.status || 'Active'
            });
        }
    }, [initialData, isEditMode]);

    const { name, category, cost, startDate, billingCycle, nextBillingDate, endDate, status, reminderEnabled, reminderDays } = formData;

    const onChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        onFormSubmit(formData);
    };

    return (
        <section className="form">
            <h2>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</h2>
            <form onSubmit={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Service Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={status} onChange={onChange}>
                            <option value="Active">Active</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={category} onChange={onChange} required>
                            <option value="">Select Category</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Music">Music</option>
                            <option value="OTT / Streaming">OTT / Streaming</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Education">Education</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Cloud Services">Cloud Services</option>
                            <option value="Developer Tools">Developer Tools</option>
                            <option value="Design Tools">Design Tools</option>
                            <option value="Finance">Finance</option>
                            <option value="Health & Fitness">Health & Fitness</option>
                            <option value="Food & Delivery">Food & Delivery</option>
                            <option value="News & Media">News & Media</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Travel">Travel</option>
                            <option value="Storage">Storage</option>
                            <option value="Communication">Communication</option>
                            <option value="Security">Security</option>
                            <option value="AI Tools">AI Tools</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Cost (₹)</label>
                        <input type="number" name="cost" value={cost} onChange={onChange} required />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={startDate} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>End Date (Optional)</label>
                        <input type="date" name="endDate" value={endDate} onChange={onChange} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Billing Cycle</label>
                        <select name="billingCycle" value={billingCycle} onChange={onChange}>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Next Billing Date</label>
                        <input type="date" name="nextBillingDate" value={nextBillingDate} onChange={onChange} required />
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        name="reminderEnabled"
                        checked={reminderEnabled}
                        onChange={onChange}
                        id="reminderToggle"
                        style={{ width: 'auto', margin: 0 }}
                    />
                    <label htmlFor="reminderToggle" style={{ margin: 0, cursor: 'pointer' }}>Enable Renewal Reminder</label>
                </div>

                {reminderEnabled && (
                    <div className="form-group">
                        <label>Remind Me</label>
                        <select name="reminderDays" value={reminderDays} onChange={onChange}>
                            <option value="3">3 days before</option>
                            <option value="7">7 days before</option>
                            <option value="14">14 days before</option>
                        </select>
                    </div>
                )}

                <div className="form-group" style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn btn-block">{isEditMode ? 'Update' : 'Add'} Subscription</button>
                    {isEditMode && <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>}
                </div>
            </form>
        </section>
    );
};

export default SubscriptionForm;
