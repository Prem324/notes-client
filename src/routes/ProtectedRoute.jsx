import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import Loader from "../components/common/Loader";

function ProtectedRoute({ children }) {

    const {
        isLoggedIn,
        loading,
    } = useAuth();


    if (loading) {
        return (
            <Loader message="Checking authentication..." />
        );
    }


    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}

export default ProtectedRoute;