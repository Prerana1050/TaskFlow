
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./Tasks.css";

function Tasks() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [projectName, setProjectName] = useState("Project Tasks");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [dueDate, setDueDate] = useState("");

    const [editId, setEditId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [updatingStatusTaskId, setUpdatingStatusTaskId] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const response = await API.get(`/tasks/${projectId}`, {
                params: {
                    status: statusFilter || undefined,
                    priority: priorityFilter || undefined,
                    search: search.trim() || undefined
                }
            });

            setTasks(response.data.tasks || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectName = async () => {
        try {
            const response = await API.get("/projects");

            const project = response.data.find(
                (item) => item._id === projectId
            );

            if (project) {
                setProjectName(project.name);
            }
        } catch (err) {
            console.error("Could not load project details:", err);
        }
    };

    useEffect(() => {
        fetchProjectName();
    }, [projectId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks();
        }, 300);

        return () => clearTimeout(timer);
    }, [projectId, statusFilter, priorityFilter, search]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setDueDate("");
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!dueDate) {
            setError("Please select a due date.");
            return;
        }

        if (title.trim().length > 100) {
            setError("Task title cannot exceed 100 characters.");
            return;
        }

        if (description.trim().length > 500) {
            setError("Description cannot exceed 500 characters.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const taskData = {
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate
            };

            if (editId) {
                await API.put(`/tasks/${editId}`, taskData);
                setMessage("Task updated successfully.");
            } else {
                await API.post(`/tasks/${projectId}`, taskData);
                setMessage("Task created successfully.");
            }

            resetForm();
            await fetchTasks();
        } catch (err) {
            setError(
                err.response?.data?.message || "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (task) => {
        setEditId(task._id);
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setDueDate(
            task.dueDate
                ? new Date(task.dueDate).toISOString().slice(0, 10)
                : ""
        );

        setError("");
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        try {
            setDeletingTaskId(taskId);
            setError("");
            setMessage("");

            await API.delete(`/tasks/${taskId}`);

            setMessage("Task deleted successfully.");
            await fetchTasks();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to delete task."
            );
        } finally {
            setDeletingTaskId(null);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setUpdatingStatusTaskId(taskId);
            setError("");
            setMessage("");

            await API.patch(`/tasks/${taskId}/status`, {
                status: newStatus
            });

            setMessage("Task status updated successfully.");
            await fetchTasks();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update status."
            );
        } finally {
            setUpdatingStatusTaskId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const getPriorityClass = (value) => {
        if (value === "High") return "danger";
        if (value === "Medium") return "warning";
        return "success";
    };

    return (
        <div className="tasks-page">

            {/* Navbar */}
            <nav className="navbar navbar-dark tasks-navbar">
                <span className="navbar-brand fw-bold">TaskFlow</span>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </button>

                    <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => navigate("/projects")}
                    >
                        Projects
                    </button>

                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container tasks-content py-4">

                {/* Page Heading */}
                <div className="mb-4">
                    <button
                        className="btn btn-link text-decoration-none ps-0 tasks-back-btn"
                        onClick={() => navigate("/projects")}
                    >
                        ← Back to Projects
                    </button>

                    <h2 className="tasks-heading">{projectName}</h2>

                    <p className="tasks-subtitle">
                        Create, track and manage your project tasks.
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {/* Create / Edit Task */}
                <div className="tasks-panel card mb-4">
                    <div className="card-body">

                        <h5 className="mb-3">
                            {editId ? "Edit Task" : "Create New Task"}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">

                                <div className="col-12 col-md-6">
                                    <label className="form-label">
                                        Task Title
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter task title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Description
                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Enter task description"
                                        value={description}
                                        maxLength={500}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label">
                                        Priority
                                    </label>

                                    <select
                                        className="form-select"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <button
                                        type="submit"
                                        className="btn task-submit-btn me-2"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editId
                                            ? "Update Task"
                                            : "Create Task"}
                                    </button>

                                    {editId && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary task-cancel-btn"
                                            onClick={resetForm}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                            </div>
                        </form>
                    </div>
                </div>

                {/* Filters */}
                <div className="tasks-panel card mb-4">
                    <div className="card-body">

                        <h5 className="mb-3">Filter Tasks</h5>

                        <div className="row g-3">

                            <div className="col-12 col-md-4">
                                <label className="form-label">
                                    Search by title
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search tasks..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">
                                    Filter by status
                                </label>

                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">
                                    Filter by priority
                                </label>

                                <select
                                    className="form-select"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                        </div>

                        <button
                            className="btn btn-sm btn-outline-secondary tasks-clear-btn mt-3"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                                setPriorityFilter("");
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Task List */}
                <h5 className="tasks-section-heading mb-3">
                    Tasks ({tasks.length})
                </h5>

                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <div className="tasks-empty text-center text-muted">
                        No tasks found. Create a task or change your filters.
                    </div>
                ) : (
                    <div className="row g-3">
                        {tasks.map((task) => (
                            <div
                                className="col-12 col-lg-6"
                                key={task._id}
                            >
                                <div className="task-card card h-100">
                                    <div className="card-body">

                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                            <h5 className="card-title">
                                                {task.title}
                                            </h5>

                                            <span
                                                className={`badge text-bg-${getPriorityClass(task.priority)}`}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>

                                        <p className="text-muted">
                                            {task.description ||
                                                "No description provided."}
                                        </p>

                                        <p className="mb-2">
                                            <strong>Due date: </strong>
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </p>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Status
                                            </label>

                                            <select
                                                className="form-select"
                                                value={task.status}
                                                disabled={updatingStatusTaskId === task._id}
                                                onChange={(e) =>
                                                    handleStatusChange(task._id, e.target.value)
                                                }
                                            >
                                                <option value="To Do">To Do</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleEdit(task)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(task._id)}
                                                disabled={deletingTaskId === task._id}
                                            >
                                                {deletingTaskId === task._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Tasks;
