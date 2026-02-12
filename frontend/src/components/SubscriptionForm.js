import React, { useState, useEffect } from 'react';

const SubscriptionForm = ({ onFormSubmit, initialData = {}, isEditMode = false, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Other',
        price: '',
        currency: 'INR',
        startDate: '',
        billingCycle: 'Monthly'
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            const formattedStart = initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '';

            setFormData({
                ...initialData,
                startDate: formattedStart,
                price: initialData.price || '',
                billingCycle: initialData.billingCycle || 'Monthly'
            });
        }
    }, [initialData, isEditMode]);

    const { name, category, price, startDate, billingCycle } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        onFormSubmit({
            ...formData,
            price: Number(formData.price)
        });
    };

    return (
        <section className="form">
            <h2>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Service Name</label>
                    <input type="text" name="name" value={name} onChange={onChange} required />
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
                        <label>Price (₹)</label>
                        <input type="number" name="price" value={price} onChange={onChange} required />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn btn-block">{isEditMode ? 'Update' : 'Add'} Subscription</button>
                    {isEditMode && <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>}
                </div>
            </form>
        </section>
    );
};

export default SubscriptionForm;
