import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";

function AdminRoute() {
    const {
        user,
        loading,
        isLoggedIn,
    } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/notes" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;