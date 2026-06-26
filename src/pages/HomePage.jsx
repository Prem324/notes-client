import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="hero">
      <h1>Organize your notes in one place</h1>

      <p>
        Create notes, add comments, upload attachments, and manage your profile.
      </p>

      <div className="hero-actions">
        {isLoggedIn ? (
          <Link to="/notes" className="btn">
            Go to Notes
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn">
              Get Started
            </Link>

            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default HomePage;