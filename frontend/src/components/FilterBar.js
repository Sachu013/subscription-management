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
            background: 'var(--card-bg)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            marginBottom: '30px',
            boxShadow: 'var(--shadow)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '15px'
            }}>
                {/* Search */}
                <div className="control-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Search Name
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                        <input
                            type="text"
                            placeholder="e.g. Netflix..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '35px',
                                width: '100%',
                                background: 'var(--background)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                height: '42px'
                            }}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="control-group">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Status
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaFilter style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{
                                paddingLeft: '35px',
                                width: '100%',
                                appearance: 'none',
                                background: 'var(--background)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                height: '42px'
                            }}
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
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Category
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FaFilter style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                paddingLeft: '35px',
                                width: '100%',
                                appearance: 'none',
                                background: 'var(--background)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                height: '42px'
                            }}
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
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                            Billing Cycle
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaSort style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                            <select
                                value={billingCycle}
                                onChange={(e) => setBillingCycle(e.target.value)}
                                style={{
                                    paddingLeft: '35px',
                                    width: '100%',
                                    appearance: 'none',
                                    background: 'var(--background)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    height: '42px'
                                }}
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
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    {/* Price Range */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                            Price Range (₹)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', top: '11px', left: '10px', color: 'var(--text-secondary)', fontSize: '11px', opacity: 0.6 }}>Min</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    style={{
                                        paddingLeft: '40px',
                                        width: '100%',
                                        background: 'var(--background)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        height: '42px'
                                    }}
                                />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>to</span>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', top: '11px', left: '10px', color: 'var(--text-secondary)', fontSize: '11px', opacity: 0.6 }}>Max</span>
                                <input
                                    type="number"
                                    placeholder="any"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    style={{
                                        paddingLeft: '40px',
                                        width: '100%',
                                        background: 'var(--background)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        height: '42px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="btn btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            height: '42px',
                            padding: '0 20px',
                            fontSize: '14px'
                        }}
                    >
                        <FaTimes /> Reset
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
