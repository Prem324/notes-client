import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Button from "../common/Button";

function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Notes App
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        {isLoggedIn ? (
          <>
            <Link to="/notes">Notes</Link>
            <Link to="/profile">Profile</Link>

            <Button type="button" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;