
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get("/dashboard");
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return <div className="text-center mt-5">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="alert alert-danger m-4">{error}</div>;
    }

    const stats = [
        { title: "Total Projects", value: data.totalProjects, color: "stat-plum" },
        { title: "Total Tasks", value: data.totalTasks, color: "stat-orange" },
        { title: "Completed Tasks", value: data.completedTasks, color: "stat-green" },
        { title: "Pending Tasks", value: data.pendingTasks, color: "stat-yellow" },
        { title: "Overdue Tasks", value: data.overdueCount, color: "stat-red" }
    ];

    return (
        <div className="dashboard-page">

            <nav className="dashboard-navbar">
                <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <Link className="dashboard-brand" to="/dashboard">
                        TaskFlow
                    </Link>

                    <div className="d-flex align-items-center gap-3">
                        <span className="dashboard-welcome">
                            Welcome, {user.name}
                        </span>

                        <button
                            className="dashboard-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="dashboard-content">

                <h1 className="dashboard-heading">Dashboard</h1>
                <p className="dashboard-subtitle">
                    Here's an overview of your workspace.
                </p>

                <div className="row g-3">
                    {stats.map((item) => (
                        <div className="col-12 col-sm-6 col-lg-4 col-xl" key={item.title}>
                            <div className="stat-card">
                                <p className="stat-title">{item.title}</p>
                                <h2 className={`stat-value ${item.color}`}>
                                    {item.value}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="dashboard-panel">
                    <h3 className="dashboard-panel-title">Quick Actions</h3>
                    <p className="text-muted small">
                        Manage your projects and workspace.
                    </p>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                        <Link to="/projects" className="dashboard-action">
                            View Projects
                        </Link>

                        {user.role === "admin" && (
                            <Link to="/admin" className="dashboard-action dashboard-action-accent">
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </section>

                <section className="dashboard-panel">
                    <h3 className="dashboard-panel-title overdue-title">
                        Overdue Tasks
                    </h3>

                    {data.overdueTasks.length === 0 ? (
                        <p className="dashboard-empty">
                            No overdue tasks. Great work!
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Priority</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.overdueTasks.map((task) => (
                                        <tr key={task._id}>
                                            <td>{task.title}</td>
                                            <td>{task.priority}</td>
                                            <td>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className="dashboard-status">
                                                    {task.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default Dashboard;
