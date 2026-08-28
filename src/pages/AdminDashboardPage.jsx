import { useEffect, useState } from "react";

import { adminService } from "../features/admin/adminService";
import ErrorMessage from "../components/common/ErrorMessage";
import AdminUsers from "../components/admin/AdminUsers";
import { getErrorMessage } from "../utils/getErrorMessage";

import "./AdminDashboardPage.css";


function AdminDashboardPage() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        async function fetchDashboard() {

            try {

                setLoading(true);
                setError("");

                const result =
                    await adminService.getDashboard();

                setDashboard(result.data);

            } catch (error) {

                setError(
                    getErrorMessage(
                        error,
                        "Failed to load admin dashboard"
                    )
                );

            } finally {

                setLoading(false);

            }
        }

        fetchDashboard();

    }, []);


    if (loading) {
        return <p>Loading dashboard...</p>;
    }


    return (
        <main className="admin-dashboard">

            <header className="admin-dashboard-header">

                <h1>
                    Admin Dashboard
                </h1>

                <p>
                    Manage users and monitor
                    application statistics.
                </p>

            </header>


            <ErrorMessage message={error} />


            {dashboard && (

                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <h3>
                            Total Users
                        </h3>

                        <p className="admin-stat-value">
                            {dashboard.stats.totalUsers}
                        </p>

                    </div>


                    <div className="admin-stat-card">

                        <h3>
                            Total Notes
                        </h3>

                        <p className="admin-stat-value">
                            {dashboard.stats.totalNotes}
                        </p>

                    </div>


                    <div className="admin-stat-card">

                        <h3>
                            Verified Users
                        </h3>

                        <p className="admin-stat-value">
                            {dashboard.stats.verifiedUsers}
                        </p>

                    </div>


                    <div className="admin-stat-card">

                        <h3>
                            Admin Users
                        </h3>

                        <p className="admin-stat-value">
                            {dashboard.stats.adminUsers}
                        </p>

                    </div>

                </section>

            )}


            <AdminUsers />
            

        </main>
    );
}


export default AdminDashboardPage;