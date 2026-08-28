import { useEffect, useState } from "react";

import { adminService } from "../../features/admin/adminService";
import ErrorMessage from "../common/ErrorMessage";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
    showSuccessToast,
    showErrorToast,
} from "../../utils/toast";

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] =
        useState(null);

    useEffect(() => {

        async function fetchUsers() {

            try {

                setLoading(true);
                setError("");

                const result =
                    await adminService.getUsers();

                setUsers(result.data.users);

            } catch (error) {

                setError(
                    getErrorMessage(
                        error,
                        "Failed to load users"
                    )
                );

            } finally {

                setLoading(false);

            }
        }

        fetchUsers();

    }, []);


    async function handleRoleChange(
        userId,
        newRole
    ) {

        try {

            setActionLoading(userId);

            const result =
                await adminService.updateUserRole(
                    userId,
                    newRole
                );

            const updatedUser =
                result.data;

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                            ...user,
                            role: updatedUser.role,
                        }
                        : user
                )
            );

            showSuccessToast(
                result.message ||
                "User role updated successfully"
            );

        } catch (error) {

            const message =
                getErrorMessage(
                    error,
                    "Failed to update user role"
                );

            showErrorToast(message);

        } finally {

            setActionLoading(null);

        }
    }


    if (loading) {
        return <p>Loading users...</p>;
    }

    async function handleDeleteUser(userId) {

    const confirmed = window.confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
        return;
    }

    try {

        setActionLoading(userId);

        const result =
            await adminService.deleteUser(userId);

        setUsers((currentUsers) =>
            currentUsers.filter(
                (user) => user._id !== userId
            )
        );

        showSuccessToast(
            result.message ||
            "User deleted successfully"
        );

    } catch (error) {

        const message =
            getErrorMessage(
                error,
                "Failed to delete user"
            );

        showErrorToast(message);

    } finally {

        setActionLoading(null);

    }
}


    return (
    <section className="admin-users-section">

        <div className="admin-users-header">

            <h2>
                Users Management
            </h2>

            <p>
                Manage user roles and accounts.
            </p>

        </div>


        <ErrorMessage message={error} />


        {users.length === 0 ? (

            <p style={{ padding: "24px" }}>
                No users found.
            </p>

        ) : (

            <div className="admin-users-table-wrapper">

                <table className="admin-users-table">

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Verification</th>

                            <th>Role</th>

                            <th>Action</th>

                        </tr>

                    </thead>


                    <tbody>

                        {users.map((user) => (

                            <tr key={user._id}>

                                <td>

                                    <span className="admin-user-name">
                                        {user.name}
                                    </span>

                                </td>


                                <td>
                                    {user.email}
                                </td>


                                <td>

                                    {user.emailVerified ? (

                                        <span className="admin-status-verified">
                                            Verified
                                        </span>

                                    ) : (

                                        <span className="admin-status-unverified">
                                            Not verified
                                        </span>

                                    )}

                                </td>


                                <td>

                                    <select
                                        className="admin-role-select"
                                        value={user.role}
                                        disabled={
                                            actionLoading ===
                                            user._id
                                        }
                                        onChange={(event) =>
                                            handleRoleChange(
                                                user._id,
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="user">
                                            User
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>

                                    </select>

                                </td>


                                <td>

                                    <button
                                        type="button"
                                        className="admin-delete-button"
                                        disabled={
                                            actionLoading ===
                                            user._id
                                        }
                                        onClick={() =>
                                            handleDeleteUser(
                                                user._id
                                            )
                                        }
                                    >

                                        {actionLoading ===
                                        user._id
                                            ? "Processing..."
                                            : "Delete"}

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        )}

    </section>
);
}

export default AdminUsers;