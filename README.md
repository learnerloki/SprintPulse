# SprintPulse — Agile Sprint Tracker

> **Sankar Group Front-End Development Internship Assignment (48-Hour Deadline)**  
> A lightweight, responsive SaaS landing page and interactive sprint tracker designed for modern agile development teams.

---

## 🚀 Live Demo & Repository
- **GitHub Repository:** [SprintPulse on GitHub](https://github.com/YOUR_USERNAME/sprintpulse) *(Replace with your repo link before submitting)*
- **Live Deployment:** [SprintPulse Live](https://YOUR_USERNAME.github.io/sprintpulse/) *(Replace with your deployment URL before submitting)*

---

## 📋 Project Overview

**SprintPulse** is a clean, dark-mode SaaS product interface built with zero external framework dependencies. It showcases modern front-end engineering principles:
1. **Interactive SaaS Landing Page:** Sticky navigation with active scroll-spy, hero section with CSS Kanban mockup, core feature highlights, "How It Works" workflow, 3-tier pricing matrix, and demo request contact form with real-time validation.
2. **Live Task Management Demo:** Embedded interactive Kanban board (To Do, In Progress, Done) with priority indicators, team assignees, full CRUD operations (Add, Edit, Delete), and offline `localStorage` persistence.
3. **Interactive Calendar View:** Multi-month calendar visualization with task chips, navigation controls, and direct task inspection.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup (`<nav>`, `<section>`, `<dialog>`, `<form>`, `<button>`, ARIA attributes).
- **CSS3:** Custom design system using CSS variables, Flexbox, CSS Grid, glassmorphism, responsive media queries, and smooth transitions.
- **Vanilla JavaScript (ES6+):** Pure client-side state machine, event delegation pattern, DOM sanitization (`escapeHtml`), and `localStorage` API.
- **Google Fonts:** Typography powered by `Bungee` (display) and `Rubik` (body).

---

## 💻 Local Setup & Run Instructions

No build tools, bundlers, or `node_modules` required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sprintpulse.git
   cd sprintpulse
   ```
2. **Open in your browser:**
   - Simply double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.
   - Or use VS Code Live Server extension: right-click `index.html` and choose **"Open with Live Server"**.

---

## 📐 Design Choices & Architecture

- **Dark-Theme Design System:** Built with an intentional surface scale (`#0b101e` canvas → `#131827` cards → `#1e2536` hover states) and cobalt blue accents (`#1d4ed8`) avoiding eye fatigue while maintaining WCAG contrast ratios.
- **Single Source of Truth (`state`):** State is unified in a single immutable-like JavaScript object. Any modification (add, edit, delete, status change) synchronizes with `localStorage` and triggers pure re-renders.
- **Event Delegation:** Container-level event listeners with `data-action` attributes handle task mutations, preventing memory leaks and avoiding inline DOM handler antipatterns.
- **Security & Hygiene:** String interpolation through `escapeHtml()` prevents XSS injection from task inputs. Modal interactions utilize the native `<dialog>` API with custom overlays, replacing native browser alerts and confirms.
- **Responsive Layout:** Custom breakpoints (860px, 768px, 640px) ensuring fluid card wrapping, hamburger navigation toggle, and horizontally scrollable calendar grids on smaller screens.

---

## 💡 Challenges Solved (5–8 Line Explanation)

1. **Calendar Date-Math & Day-Overflows:** Standard JavaScript date mutations often produce month drift (e.g., advancing from Jan 31 pushes into March). This was solved by normalizing date calculations to the 1st of each month before applying month offsets.
2. **Accessible Native Modal Without Stacking Context Conflicts:** Browser native `<dialog>` elements create top-layer backdrops that can clash with fixed headers. This was resolved by pairing transparent native backdrops with styled CSS overlay containers.
3. **Zero-Lag Interactive Demo with Empty State Prevention:** First-time visitors are greeted with pre-seeded agile tasks so the demo never displays an unengaging blank slate, while the "Reset Demo" control allows resetting back to sample data at any time.

---

## 📸 Screenshots

| Desktop View | Mobile Responsive View |
| :---: | :---: |
| *(Capture desktop landing page & save to `screenshots/desktop.png`)* | *(Capture mobile layout with hamburger & save to `screenshots/mobile.png`)* |

---

## 📄 License
MIT License. Created for the Sankar Group Front-End Development Internship Assessment.
