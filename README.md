# TaskFlow – Task Management Application

TaskFlow is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) task management application designed to help users organize projects, manage tasks, track progress, and monitor deadlines through a simple and responsive interface.

## Live Demo

- **Frontend:** https://task-flow-gilt-mu-76.vercel.app/login
- **Backend:** https://taskflow-rb5m.onrender.com/

## Features

### Authentication
- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Protected routes and user sessions.

### Project Management
- Create, view, update, and delete projects.
- Users can manage their own projects.
- Project deletion also removes its associated tasks.

### Task Management
- Create, view, update, and delete tasks.
- Set task priorities: Low, Medium, and High.
- Manage task statuses: To Do, In Progress, and Done.
- Set due dates for tasks.
- Update task status directly from the task list.

### Search and Filtering
- Filter tasks by status.
- Filter tasks by priority.
- Search tasks by title.

### Dashboard
- View total projects and tasks.
- Track completed and pending tasks.
- Monitor overdue tasks.
- View task progress through a centralized dashboard.

### Responsive Design
- Responsive interface for desktop, tablet, and mobile devices.
- Bootstrap-based styling.
- Consistent plum and white theme.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Bootstrap, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, bcrypt |
| API Communication | Axios |
| Deployment | Vercel, Render |

## Project Structure

```text
TaskFlow/
│
├── backend/
│   ├── config/
│   ├── controller/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vercel.json
│
└── README.md
```
## Future Improvements

- Kanban board with drag-and-drop task management.
- Team collaboration and task assignment.
- Email notifications for upcoming deadlines.
- Advanced task analytics.

## Author

**Prerana Maiti**

B.Tech – Computer Science and Engineering

GitHub: [Prerana1050](https://github.com/Prerana1050)

---

*TaskFlow – Plan Projects. Manage Tasks. Track Progress.*
