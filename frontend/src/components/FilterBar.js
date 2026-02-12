import React from 'react';
import { FaSearch, FaFilter, FaSort, FaTimes } from 'react-icons/fa';

const FilterBar = ({
    searchTerm,
    setSearchTerm,
    status,
    setStatus,
    category,
    setCategory,
    categories = [],
    billingCycle,
    setBillingCycle,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    onReset,
    showAdvanced = true
}) => {
    return (
        <div className="filter-bar" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '30px'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
            }}>
                {/* Search */}
                <div className="control-group">
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '5px' }}>
                        Search Name
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', top: '12px', left: '12px', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                            type="text"
                            placeholder="e.g. Netflix..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '35px', width: '100%' }}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="control-group">
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '5px' }}>
                        Status
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaFilter style={{ position: 'absolute', top: '12px', left: '12px', color: 'rgba(255,255,255,0.4)' }} />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ paddingLeft: '35px', width: '100%', appearance: 'none' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>

                {/* Category */}
                <div className="control-group">
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '5px' }}>
                        Category
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaFilter style={{ position: 'absolute', top: '12px', left: '12px', color: 'rgba(255,255,255,0.4)' }} />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ paddingLeft: '35px', width: '100%', appearance: 'none' }}
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Billing Cycle */}
                {showAdvanced && (
                    <div className="control-group">
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '5px' }}>
                            Billing Cycle
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaSort style={{ position: 'absolute', top: '12px', left: '12px', color: 'rgba(255,255,255,0.4)' }} />
                            <select
                                value={billingCycle}
                                onChange={(e) => setBillingCycle(e.target.value)}
                                style={{ paddingLeft: '35px', width: '100%', appearance: 'none' }}
                            >
                                <option value="All">All Cycles</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {showAdvanced && (
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                    gap: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {/* Price Range */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>
                            Price Range (₹)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', top: '10px', left: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Min</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    style={{ paddingLeft: '40px', width: '100%' }}
                                />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>to</span>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', top: '10px', left: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Max</span>
                                <input
                                    type="number"
                                    placeholder="any"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    style={{ paddingLeft: '40px', width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            height: '42px'
                        }}
                    >
                        <FaTimes /> Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
