import React, { useState, useEffect } from 'react';

const SubscriptionForm = ({ onFormSubmit, initialData = {}, isEditMode = false, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        cost: '',
        currency: 'INR',
        startDate: '',
        billingCycle: 'Monthly',
        nextBillingDate: '',
        reminderEnabled: false,
        reminderDays: 7,
        status: 'Active'
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            // Format dates to YYYY-MM-DD for input fields if they exist
            const formattedStart = initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '';
            const formattedNext = initialData.nextBillingDate ? new Date(initialData.nextBillingDate).toISOString().split('T')[0] : '';

            setFormData({ ...initialData, startDate: formattedStart, nextBillingDate: formattedNext });
        }
    }, [initialData, isEditMode]);

const { name, category, cost, startDate, billingCycle, nextBillingDate, reminderEnabled, reminderDays } = formData;

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
                <div className="form-group">
                    <label>Service Name</label>
                    <input type="text" name="name" value={name} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={category} onChange={onChange} required>
                        <option value="">Select category</option>
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
                    <label>Cost</label>
                    <input type="number" name="cost" value={cost} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" value={startDate} onChange={onChange} required />
                </div>
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
                <div className="form-group">
                    <button type="submit" className="btn btn-block">{isEditMode ? 'Update' : 'Add'} Subscription</button>
                    {isEditMode && <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>}
                </div>
            </form>
        </section>
    );
};

export default SubscriptionForm;
