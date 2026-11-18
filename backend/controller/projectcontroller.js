
const Project = require("../models/project");
const Task = require("../models/task");

// Create a project

const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({
                message: "Project name cannot exceed 100 characters"
            });
        }

        if (description !== undefined &&
            (typeof description !== "string" || description.trim().length > 500)) {
            return res.status(400).json({
                message: "Description cannot exceed 500 characters"
            });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description ? description.trim() : "",
            owner: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Server error while creating project"
        });
    }
};


// Get projects of logged-in user
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            members: req.user.id
        }).populate("owner", "name email");

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Name validation
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({
                message: "Project name cannot exceed 100 characters"
            });
        }

        // Description validation
        if (description !== undefined &&
            (typeof description !== "string" || description.trim().length > 500)) {
            return res.status(400).json({
                message: "Description cannot exceed 500 characters"
            });
        }

        project.name = name.trim();
        project.description = description ? description.trim() : "";

        await project.save();

        return res.status(200).json({
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.error("Update project error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Server error while updating project"
        });
    }
};


// Delete project and its tasks
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        await Task.deleteMany({
            project: project._id
        });

        res.status(200).json({
            message: "Project and its tasks deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProject, getMyProjects, updateProject, deleteProject };
