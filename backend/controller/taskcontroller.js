
const Task = require("../models/task");
const Project = require("../models/project");

// Create a task
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo } = req.body;
        const { projectId } = req.params;

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        if (title.trim().length > 100) {
            return res.status(400).json({
                message: "Task title cannot exceed 100 characters"
            });
        }

        // Validate description
        if (description !== undefined &&
            (typeof description !== "string" || description.trim().length > 500)) {
            return res.status(400).json({
                message: "Description cannot exceed 500 characters"
            });
        }

        // Validate due date
        if (!dueDate || isNaN(new Date(dueDate).getTime())) {
            return res.status(400).json({
                message: "Please provide a valid due date"
            });
        }

        // Validate priority
        if (priority !== undefined &&
            !["Low", "Medium", "High"].includes(priority)) {
            return res.status(400).json({
                message: "Priority must be Low, Medium, or High"
            });
        }

        // Check project membership
        const project = await Project.findOne({
            _id: projectId,
            members: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found or access denied"
            });
        }

        // Validate assignee
        if (assignedTo && !project.members.some(
            member => member.toString() === assignedTo
        )) {
            return res.status(400).json({
                message: "Assignee must be a project member"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description ? description.trim() : "",
            priority: priority || "Medium",
            dueDate,
            project: projectId,
            createdBy: req.user.id,
            assignedTo: assignedTo || null
        });

        return res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error("Create task error:", error);

        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Server error while creating task"
        });
    }
};

// Get all tasks of a project
// Get tasks with filtering and search
const getProjectTasks = async (req, res) => {
    try {
        const { status, priority, search } = req.query;

        // Check whether user belongs to the project
        const project = await Project.findOne({
            _id: req.params.projectId,
            members: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Build filter object
        const filter = {
            project: req.params.projectId
        };

        // Filter by status
        if (status) {
            if (!["To Do", "In Progress", "Done"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            filter.status = status;
        }

        // Filter by priority
        if (priority) {
            if (!["Low", "Medium", "High"].includes(priority)) {
                return res.status(400).json({
                    message: "Invalid priority"
                });
            }

            filter.priority = priority;
        }

        // Search by title
        if (search && search.trim()) {
            const safeSearch = search.trim().replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
);

filter.title = {
    $regex: safeSearch,
    $options: "i"
};
        }

        const tasks = await Task.find(filter)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update task status
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (typeof status !== "string" ||
            !["To Do", "In Progress", "Done"].includes(status)) {
            return res.status(400).json({
                message: "Status must be To Do, In Progress, or Done"
            });
        }

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findOne({
            _id: task.project,
            members: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: "You cannot update this task"
            });
        }

        task.status = status;
        await task.save();

        return res.status(200).json({
            message: "Task status updated successfully",
            task
        });

    } catch (error) {
        console.error("Update task status error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        return res.status(500).json({
            message: "Server error while updating task status"
        });
    }
};

// Update Task
const updateTask = async (req, res) => {
    try {
        const { title, description, priority, status, dueDate } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findOne({
            _id: task.project,
            members: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: "You are not allowed to edit this task"
            });
        }

        // Validate title
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title is required"
                });
            }

            if (title.trim().length > 100) {
                return res.status(400).json({
                    message: "Task title cannot exceed 100 characters"
                });
            }

            task.title = title.trim();
        }

        // Validate description
        if (description !== undefined) {
            if (typeof description !== "string" || description.trim().length > 500) {
                return res.status(400).json({
                    message: "Description cannot exceed 500 characters"
                });
            }

            task.description = description.trim();
        }

        // Validate priority
        if (priority !== undefined) {
            if (typeof priority !== "string" || !["Low", "Medium", "High"].includes(priority)) {
                return res.status(400).json({
                    message: "Invalid priority"
                });
            }

            task.priority = priority;
        }

        // Validate status
        if (status !== undefined) {
            if (!["To Do", "In Progress", "Done"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            task.status = status;
        }

        // Validate due date
        if (dueDate !== undefined) {
            if (!dueDate || isNaN(Date.parse(dueDate))) {
                return res.status(400).json({
                    message: "Invalid due date"
                });
            }

            task.dueDate = dueDate;
        }

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Server error while updating task"
        });
    }
};


// Delete Task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findOne({
            _id: task.project,
            members: req.user.id
        });

        if (!project) {
            return res.status(403).json({
                message: "You are not allowed to delete this task"
            });
        }

        await Task.findByIdAndDelete(req.params.taskId);

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getProjectTasks,
    updateTaskStatus,
    updateTask,
    deleteTask
};
