# SprintPulse

### Keep sprints on track. Without the chaos.

SprintPulse is a lightweight Agile sprint tracking platform designed to make task management more organized and easier to follow.

It brings together an interactive Kanban board, task management, and a calendar view in a clean, responsive interface. Users can create tasks, assign priorities, track progress, and manage deadlines without needing an account or additional software.

---

## Screenshots

### Desktop — Landing Page

![SprintPulse Landing Page](screenshots/01-desktop.png)

### Interactive Sprint Dashboard

![SprintPulse Dashboard](screenshots/02-dashboard.png)

### Mobile Layout

![SprintPulse Mobile View](screenshots/03-mobile.png)

---

## Features

### Sprint & Task Management

- Create tasks with titles, descriptions, and due dates.
- Edit and delete existing tasks.
- Assign tasks to team members.
- Set task priorities: High, Medium, and Low.
- Update task status as work progresses.

### Interactive Kanban Board

- Organize tasks into three workflow stages:
  - To Do
  - In Progress
  - Done
- View task details and manage tasks directly from the board.
- Automatically update task counts when tasks change.

### Calendar View

- View scheduled tasks in a monthly calendar.
- Navigate between previous and upcoming months.
- Highlight the current date.
- Select a task from the calendar to open its editing interface.

### Additional Functionality

- Switch between Kanban and Calendar views.
- Save tasks using browser LocalStorage.
- Restore sample tasks using the Reset Demo option.
- Display toast notifications and custom confirmation dialogs.
- Validate contact form inputs and display a submission confirmation.
- Responsive navigation for smaller screens.

---

## Technology Stack

| Technology        | Purpose                                 |
| ----------------- | --------------------------------------- |
| HTML5             | Structure and content                   |
| CSS3              | Styling, layouts, and responsive design |
| JavaScript (ES6+) | Application logic and interactivity     |
| LocalStorage      | Browser-based data persistence          |
| Google Fonts      | Typography                              |

SprintPulse is built using vanilla JavaScript without frontend frameworks or external UI libraries.

---

## Getting Started

### Prerequisites

- A modern web browser.
- Visual Studio Code (recommended, but optional).
- Live Server extension (optional).

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/learnerloki/sprintpulse.git
```

**2. Navigate to the project directory**

```bash
cd sprintpulse
```

**3. Run the application**

Open `index.html` directly in your browser.

Alternatively, open the project in Visual Studio Code and launch it using Live Server.

No package installation, build tools, or backend configuration is required.

---

## Project Structure

```text
SprintPulse/
│
├── index.html
├── styles.css
├── script.js
├── logo.png
│
├── screenshots/
│   ├── 01-desktop.png
│   ├── 02-demo.png
|   |-  03-contact.png
│   └── 04-mobile.png
│
└── README.md
```

---

## Design Choices & Challenges

SprintPulse uses a clean SaaS-style layout with consistent spacing, readable typography, and a clear visual hierarchy to keep the interface easy to navigate.

A few implementation challenges involved keeping date handling consistent across time zones, maintaining valid task data in LocalStorage, and ensuring both the Kanban board and calendar reflected the same task state.

I handled date formatting using local date values and normalized calendar navigation to avoid common JavaScript date-related issues.

LocalStorage loading also accounts for missing or malformed data, while a migration step provides default values for older task records.

Since task cards are dynamically re-rendered, event delegation was used to keep edit and delete interactions working without repeatedly attaching event listeners.

User-entered task content is escaped before being inserted into the HTML, helping prevent unintended HTML or script injection.

The interface also uses custom dialogs, inline validation, and responsive layouts to provide consistent interactions across desktop and mobile screens.

---

## Project Scope

SprintPulse is a frontend-only application.

- Task information is stored locally in the browser.
- There is no backend, database, or user authentication.
- The contact form demonstrates client-side validation and simulated submission; it does not send messages to a server.
- Pricing plans are illustrative and do not process payments.

---

**SprintPulse — Plan your work. Track your progress. Finish your sprints.**
