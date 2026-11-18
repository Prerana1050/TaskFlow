
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Projects.css";

function Projects() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [deleting, setDeleting] = useState(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await API.get("/projects");
            setProjects(response.data);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }

        if (name.trim().length > 100) {
            setError("Project name cannot exceed 100 characters.");
            return;
        }

        if (description.length > 500) {
            setError("Description cannot exceed 500 characters.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            if (editId) {
                await API.put(`/projects/${editId}`, {
                    name: name.trim(),
                    description: description.trim()
                });

                setMessage("Project updated successfully.");
            } else {
                await API.post("/projects", {
                    name: name.trim(),
                    description: description.trim()
                });

                setMessage("Project created successfully.");
            }

            resetForm();
            await fetchProjects();
        } catch (err) {
            setError(
                err.response?.data?.message || "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (project) => {
        setEditId(project._id);
        setName(project.name);
        setDescription(project.description || "");
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (projectId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project and all its tasks?"
        );

        if (!confirmed) return;

        try {
            setDeleting(projectId);
            setError("");
            setMessage("");

            await API.delete(`/projects/${projectId}`);

            setMessage("Project deleted successfully.");
            await fetchProjects();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to delete project."
            );
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="projects-page">

            <nav className="projects-navbar">
                <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <span className="projects-brand">TaskFlow</span>

                    <div className="d-flex gap-2">
                        <button
                            className="projects-nav-btn"
                            onClick={() => navigate("/dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            className="projects-logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="projects-content">

                <div className="mb-4">
                    <h1 className="projects-heading">My Projects</h1>
                    <p className="projects-subtitle">
                        Create and manage your projects in one place.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger projects-alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success projects-alert">
                        {message}
                    </div>
                )}

                <section className="projects-panel">
                    <h3 className="projects-panel-title">
                        {editId ? "Edit Project" : "Create New Project"}
                    </h3>

                    <form onSubmit={handleSubmit} className="projects-form">
                        <div className="mb-3">
                            <label className="form-label">Project Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter project name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Enter project description"
                                value={description}
                                maxLength={500}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="project-submit-btn me-2"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editId
                                ? "Update Project"
                                : "Create Project"}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                className="project-cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </section>

                <h3 className="projects-list-heading">
                    Your Projects ({projects.length})
                </h3>

                {loading ? (
                    <p>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="project-empty">
                        No projects found. Create your first project!
                    </div>
                ) : (
                    <div className="row g-3">
                        {projects.map((project) => (
                            <div
                                className="col-12 col-md-6 col-lg-4"
                                key={project._id}
                            >
                                <div className="project-card">
                                    <div className="project-card-body d-flex flex-column h-100">

                                        <h4 className="project-card-title">
                                            {project.name}
                                        </h4>

                                        <p className="project-card-description flex-grow-1">
                                            {project.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="project-actions">
                                            <button
                                                className="btn btn-sm project-manage-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${project._id}/tasks`
                                                    )
                                                }
                                            >
                                                Manage Tasks
                                            </button>

                                            <button
                                                className="btn btn-sm project-edit-btn"
                                                onClick={() => handleEdit(project)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm project-delete-btn"
                                                onClick={() =>
                                                    handleDelete(project._id)
                                                }
                                                disabled={deleting === project._id}
                                            >
                                                {deleting === project._id
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

            </main>
        </div>
    );
}

export default Projects;
