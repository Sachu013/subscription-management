import { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = () => {
    const { user, isLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.warning('Please login to continue');
        }
    }, [isLoading, user]);

    if (isLoading) return <div>Loading...</div>;

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
