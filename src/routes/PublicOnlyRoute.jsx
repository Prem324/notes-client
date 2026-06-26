import { Navigate } from "react-router-dom";
import {useAuth} from "../features/auth/AuthContext";

function PublicOnlyRoute({ children }) {
    const {isLoggedIn}=useAuth()
    
    if (isLoggedIn) {
    return <Navigate to="/notes" replace />;
    }

    return children;
}

export default PublicOnlyRoute;