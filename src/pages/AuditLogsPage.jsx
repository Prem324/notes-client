import { useEffect, useState } from "react";

import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import Pagination from "../components/common/Pagination";

import { auditLogService } from "../features/admin/auditLogService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../features/auth/AuthContext";

//import "./AuditLogsPage.css";


const DEFAULT_LIMIT = 10;


const defaultPagination = {
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
};


function AuditLogsPage() {

    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);

    const [pagination, setPagination] =
        useState(defaultPagination);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [action, setAction] =
        useState("");

    const [resource, setResource] =
        useState("");

    const [userId, setUserId] =
        useState("");

    const { logout } = useAuth();


    const fetchAuditLogs = async () => {

        try {

            setLoading(true);
            setError("");

            const result =
                await auditLogService.getAuditLogs({
                    page,
                    limit: DEFAULT_LIMIT,
                    action,
                    resource,
                    userId,
                });

            const data =
                result?.data || result;

            setLogs(
                Array.isArray(data?.logs)
                    ? data.logs
                    : []
            );

            const serverPagination =
                data?.pagination;

            if (serverPagination) {

                setPagination({

                    page:
                        Number(
                            serverPagination.currentPage ||
                            serverPagination.page ||
                            1
                        ),

                    limit:
                        Number(
                            serverPagination.limit ||
                            DEFAULT_LIMIT
                        ),

                    total:
                        Number(
                            serverPagination.totalLogs ||
                            serverPagination.total ||
                            0
                        ),

                    totalPages:
                        Math.max(
                            Number(
                                serverPagination.totalPages ||
                                1
                            ),
                            1
                        ),

                    hasNextPage:
                        Boolean(
                            serverPagination.hasNextPage
                        ),

                    hasPrevPage:
                        Boolean(
                            serverPagination.hasPrevPage
                        ),
                });
            }

        } catch (err) {

            if (err?.response?.status === 401) {

                logout();

                return;
            }

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchAuditLogs();

    }, [
        page,
        action,
        resource,
        userId,
    ]);


    const handleFilterChange = () => {

        setPage(1);

    };


    return (

        <main className="audit-logs-page">

            <header className="audit-logs-header">

                <div>

                    <h1>
                        Audit Logs
                    </h1>

                    <p>
                        Monitor important activities
                        performed in the application.
                    </p>

                </div>

            </header>


            {/* Filters */}

            <section className="audit-logs-filters">

                <select
                    value={action}
                    onChange={(event) => {

                        setAction(
                            event.target.value
                        );

                        handleFilterChange();

                    }}
                >

                    <option value="">
                        All Actions
                    </option>

                    <option value="NOTE_CREATED">
                        Note Created
                    </option>

                    <option value="NOTE_UPDATED">
                        Note Updated
                    </option>

                    <option value="NOTE_DELETED">
                        Note Deleted
                    </option>

                    <option value="USER_ROLE_UPDATED">
                        User Role Updated
                    </option>

                    <option value="USER_DELETED">
                        User Deleted
                    </option>

                </select>


                <select
                    value={resource}
                    onChange={(event) => {

                        setResource(
                            event.target.value
                        );

                        handleFilterChange();

                    }}
                >

                    <option value="">
                        All Resources
                    </option>

                    <option value="Note">
                        Note
                    </option>

                    <option value="User">
                        User
                    </option>

                </select>


                <input
                    type="text"
                    placeholder="Search by User ID"
                    value={userId}
                    onChange={(event) => {

                        setUserId(
                            event.target.value
                        );

                        handleFilterChange();

                    }}
                />

            </section>


            {/* Error */}

            {error && (

                <ErrorMessage
                    message={error}
                />

            )}


            {/* Content */}

            {loading ? (

                <div className="audit-logs-loader">

                    <Loader />

                </div>

            ) : (

                <>

                    {logs.length === 0 ? (

                        <div className="audit-empty-state">

                            <h3>
                                No audit logs found
                            </h3>

                            <p>
                                Try changing the filters
                                or check again later.
                            </p>

                        </div>

                    ) : (

                        <section className="audit-logs-list">

                            {logs.map((log) => (

                                <article
                                    className="audit-log-card"
                                    key={log._id}
                                >

                                    <div className="audit-log-card-header">

                                        <span className="audit-action">

                                            {log.action}

                                        </span>

                                        <span className="audit-time">

                                            {new Date(
                                                log.createdAt
                                            ).toLocaleString()}

                                        </span>

                                    </div>


                                    <div className="audit-log-details">

                                        <div className="audit-detail">

                                            <span>
                                                Resource
                                            </span>

                                            <strong>
                                                {log.resource}
                                            </strong>

                                        </div>


                                        <div className="audit-detail">

                                            <span>
                                                User
                                            </span>

                                            <strong>
                                                {log.user?.name ||
                                                    log.user?._id ||
                                                    "Unknown"}
                                            </strong>

                                        </div>


                                        <div className="audit-detail">

                                            <span>
                                                Resource ID
                                            </span>

                                            <strong>
                                                {log.resourceId ||
                                                    "—"}
                                            </strong>

                                        </div>


                                        <div className="audit-detail">

                                            <span>
                                                IP Address
                                            </span>

                                            <strong>
                                                {log.ipAddress ||
                                                    "—"}
                                            </strong>

                                        </div>

                                    </div>


                                    <details className="audit-metadata">

                                        <summary>
                                            View Metadata
                                        </summary>

                                        <pre>
                                            {JSON.stringify(
                                                log.metadata,
                                                null,
                                                2
                                            )}
                                        </pre>

                                    </details>

                                </article>

                            ))}

                        </section>

                    )}


                    {/* Pagination */}

                    {pagination.totalPages > 1 && (

                        <div className="audit-logs-pagination">

                            <Pagination
                                currentPage={
                                    pagination.page
                                }
                                totalPages={
                                    pagination.totalPages
                                }
                                hasNextPage={
                                    pagination.hasNextPage
                                }
                                hasPrevPage={
                                    pagination.hasPrevPage
                                }
                                onPageChange={
                                    setPage
                                }
                            />

                        </div>

                    )}

                </>

            )}

        </main>

    );
}


export default AuditLogsPage;