import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import subscriptionService from '../services/subscriptionService';
import { ThemeContext } from '../context/ThemeContext';
import Spinner from '../components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const navigate = useNavigate();
    useContext(ThemeContext);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser?.token;
                if (!token) {
                    navigate('/login');
                    return;
                }
                const data = await subscriptionService.getCalendarData(token);
                // Format events for react-big-calendar
                const formattedEvents = data.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    allDay: true
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCalendarData();
    }, [navigate]);

    const eventStyleGetter = (event) => {
        let backgroundColor = 'var(--primary)';

        if (event.status === 'Paused') {
            backgroundColor = 'var(--text-secondary)';
        } else if (event.status === 'Expired') {
            backgroundColor = 'var(--danger)';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: '#fff',
                border: 'none',
                display: 'block',
                fontSize: '12px',
                padding: '2px 5px'
            }
        };
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
                            background: 'var(--background)',
                            color: 'var(--text-primary)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: 'var(--primary)' }}>Calendar</h1>
                </div>
            </header>

            <div style={{
                background: 'var(--card-bg)',
                padding: '15px',
                borderRadius: '16px',
                height: 'clamp(500px, 85vh, 750px)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden'
            }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(event) => alert(`${event.title}\nAmount: ₹${event.amount}\nCategory: ${event.category}`)}
                />
            </div>

            <style>
                {`
                    .rbc-calendar {
                        color: var(--text-primary);
                    }
                    .rbc-off-range-bg {
                        background: var(--background);
                        opacity: 0.5;
                    }
                    .rbc-today {
                        background: var(--secondary);
                        opacity: 0.3;
                    }
                    .rbc-header {
                        color: var(--primary);
                        padding: 12px 0;
                        font-weight: 600;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row {
                        border-left: 1px solid var(--border-color);
                        border-top: 1px solid var(--border-color);
                    }
                    .rbc-toolbar button {
                        color: var(--text-primary);
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        padding: 8px 15px;
                        margin-right: 5px;
                        font-family: inherit;
                    }
                    .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
                        background: var(--primary);
                        color: #fff;
                        box-shadow: none;
                    }
                    .rbc-toolbar button:hover {
                        background: var(--background);
                        color: var(--primary);
                    }
                    [data-theme="dark"] .rbc-toolbar button:hover {
                        background: var(--border-color);
                    }
                    .rbc-month-row {
                      border-top: 1px solid var(--border-color);
                    }
                    @media (max-width: 768px) {
                        .rbc-toolbar {
                            flex-direction: column;
                            gap: 10px;
                        }
                        .rbc-toolbar-label {
                            margin: 5px 0;
                            font-weight: bold;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default CalendarView;
