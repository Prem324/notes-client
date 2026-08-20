import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import Loader from "../components/common/Loader";

function PublicOnlyRoute({ children }) {

    const {
        isLoggedIn,
        loading,
    } = useAuth();


    if (loading) {
        return (
            <Loader message="Checking authentication..." />
        );
    }


    if (isLoggedIn) {
        return (
            <Navigate
                to="/notes"
                replace
            />
        );
    }


    return children;
}

export default PublicOnlyRoute;