import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import CategoryComparison from './pages/CategoryComparison';
import CalendarView from './pages/CalendarView';
import PaymentHistory from './pages/PaymentHistory';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('WARNING: REACT_APP_GOOGLE_CLIENT_ID is not defined in your environment variables!');
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route path="/" element={<PrivateRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/subscriptions/:id/payments" element={<PaymentHistory />} />
                  <Route path="/category-comparison" element={<CategoryComparison />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Routes>
              <ToastContainer />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
