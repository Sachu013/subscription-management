import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import subscriptionService from '../services/subscriptionService';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchCalendarData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser?.token;
                if (token) {
                    const data = await subscriptionService.getCalendarData(token);
                    // Format events for react-big-calendar
                    const formattedEvents = data.map(event => ({
                        ...event,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        allDay: true
                    }));
                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.error('Error fetching calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCalendarData();
    }, [user, navigate]);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#43e97b'; // Default green

        const categoryColors = {
            'Entertainment': '#9c27b0',
            'Music': '#e91e63',
            'OTT / Streaming': '#673ab7',
            'Gaming': '#3f51b5',
            'Education': '#2196f3',
            'Productivity': '#00bcd4',
            'Cloud Services': '#009688',
            'Developer Tools': '#4caf50',
            'Design Tools': '#8bc34a',
            'Finance': '#ffeb3b',
            'Health & Fitness': '#ffc107',
            'Food & Delivery': '#ff9800',
            'News & Media': '#ff5722',
            'Shopping': '#795548',
            'Utilities': '#607d8b',
            'AI Tools': '#333333'
        };

        if (categoryColors[event.category]) {
            backgroundColor = categoryColors[event.category];
        }

        if (event.status === 'Paused') {
            backgroundColor = '#888888';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="calendar-container" style={{ padding: '30px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn"
                    style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '10px' }}
                >
                    <FaArrowLeft />
                </button>
                <h1 style={{ margin: 0 }}>Upcoming Payment Calendar</h1>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: '15px',
                height: '700px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
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
                        color: #fff;
                    }
                    .rbc-off-range-bg {
                        background: rgba(255,255,255,0.02);
                    }
                    .rbc-today {
                        background: rgba(67, 233, 123, 0.1);
                    }
                    .rbc-header {
                        color: #43e97b;
                        padding: 10px 0;
                        font-weight: bold;
                    }
                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row {
                        border-left: 1px solid rgba(255,255,255,0.1);
                        border-top: 1px solid rgba(255,255,255,0.1);
                    }
                    .rbc-toolbar button {
                        color: #fff;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
                        background: #43e97b;
                        color: #000;
                    }
                    .rbc-toolbar button:hover {
                        background: rgba(67, 233, 123, 0.2);
                    }
                `}
            </style>
        </div>
    );
};

export default CalendarView;
