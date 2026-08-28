import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function AdminRoute({ children }) {

    const {
        isLoggedIn,
        user,
        loading,
    } = useAuth();


    // VERY IMPORTANT:
    // Don't redirect while authentication
    // restoration is still in progress.
    if (loading) {
        return <p>Checking authentication...</p>;
    }


    // User is definitely not logged in
    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // User is logged in but isn't admin
    if (user?.role !== "admin") {
        return (
            <Navigate
                to="/notes"
                replace
            />
        );
    }


    return children;
}

export default AdminRoute;