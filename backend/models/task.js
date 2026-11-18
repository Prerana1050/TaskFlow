
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        maxlength: [100, "Task title cannot exceed 100 characters"]
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
        default: ""
    },

    priority: {
        type: String,
        enum: {
            values: ["Low", "Medium", "High"],
            message: "Priority must be Low, Medium, or High"
        },
        default: "Medium"
    },

    status: {
        type: String,
        enum: {
            values: ["To Do", "In Progress", "Done"],
            message: "Invalid task status"
        },
        default: "To Do"
    },

    dueDate: {
        type: Date,
        required: [true, "Due date is required"]
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
