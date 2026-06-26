import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-container">{children}</main>

      <Footer />
    </div>
  );
}

export default MainLayout;