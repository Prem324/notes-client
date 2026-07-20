import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/common/ErrorBoundary";


function App() {
  return (
    <ErrorBoundary>
      <MainLayout>
      <AppRoutes/>
    </MainLayout>

    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
    />
    </ErrorBoundary>
  );
}

export default App;