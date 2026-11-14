/* ======================================================================
   SprintPulse — JavaScript Architecture
   Principles:
   - Single source of truth: one `state` object
   - Render-on-change: every mutation saves then re-renders
   - Event delegation: one listener per container, no inline handlers
   - Pure helpers: date helpers are testable and explainable
   - Escape everything: escapeHtml() before any innerHTML
   - No alert()/confirm(): custom dialog + toast + inline errors only
   ====================================================================== */

/* ======================================================================
   DOM Elements
   ====================================================================== */
const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("nav-links");
const navHamburger = document.getElementById("nav-hamburger");

const taskFormOverlay = document.getElementById("task-form-overlay");
const taskFormDialog = document.getElementById("task-form-dialog");
const taskFormInner = document.getElementById("task-form-inner");
const dialogTitle = document.getElementById("dialog-title");
const taskFormClose = document.getElementById("task-form-close");
const taskFormCancel = document.getElementById("task-form-cancel");
const taskFormSave = document.getElementById("task-form-save");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const resetDemoBtn = document.getElementById("reset-demo-btn");

const boardTodo = document.getElementById("board-todo");
const boardProgress = document.getElementById("board-progress");
const boardDone = document.getElementById("board-done");
const countTodo = document.getElementById("count-todo");
const countProgress = document.getElementById("count-progress");
const countDone = document.getElementById("count-done");

const calendarGrid = document.getElementById("calendar-grid");
const calendarTitle = document.getElementById("calendar-title");
const calPrev = document.getElementById("cal-prev");
const calNext = document.getElementById("cal-next");

const viewBtns = document.querySelectorAll(".view-btn");
const kanbanView = document.getElementById("kanban-view");
const calendarView = document.getElementById("calendar-view");

const contactForm = document.getElementById("contact-form");
const cfToast = document.getElementById("cf-toast");
const cfToastName = document.getElementById("cf-toast-name");
const cfSubmit = document.getElementById("cf-submit");

/* Confirm dialog elements (replaces native confirm) */
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmClose = document.getElementById("confirm-close");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmConfirm = document.getElementById("confirm-confirm");

/* Task form inputs */
const tId = document.getElementById("t-id");
const tTitle = document.getElementById("t-title");
const tDate = document.getElementById("t-date");
const tDescription = document.getElementById("t-description");
const tPriority = document.getElementById("t-priority");
const tStatus = document.getElementById("t-status");
const tAssignee = document.getElementById("t-assignee");

/* ======================================================================
   State (single source of truth)
   ====================================================================== */
const state = {
  tasks: [],
  view: "kanban", // 'kanban' | 'calendar'
  calendarMonthOffset: 0, // 0 = current month
  editingId: null,
  confirmCallback: null, // callback for confirm dialog
};

const STORAGE_KEY = "sprintpulse-tasks-v2";

/* ======================================================================
   Helpers (pure functions)
   ====================================================================== */

/** Escape user text before any innerHTML to prevent XSS. */
function escapeHtml(text) {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISO() {
  return toISODate(new Date());
}

function formatDateDisplay(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Get a consistent avatar color f
 * or an assignee name. */
function getAvatarColor(name) {
  const colors = [
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#d97706",
    "#7c3aed",
    "#0891b2",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

function initials(name) {
  if (!name || name === "Unassigned") return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Auto-dismiss toast (aria-live polite for screen readers). */
function showToast(message, type = "success") {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.role = "status";
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.className =
    "toast " + (type === "success" ? "toast-success" : "toast-danger");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

/** Show custom confirm dialog (replaces native confirm). */
function showConfirm(title, message, onConfirm) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  state.confirmCallback = onConfirm;

  confirmOverlay.classList.remove("hidden");
  confirmDialog.classList.remove("hidden");
  confirmDialog.showModal();
}

function hideConfirm() {
  state.confirmCallback = null;
  if (confirmDialog && confirmDialog.open) {
    confirmDialog.close();
  }
  confirmOverlay.classList.add("hidden");
  confirmDialog.classList.add("hidden");
}

/* ======================================================================
   State & Persistence
   ====================================================================== */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let tasks = raw ? JSON.parse(raw) : null;

    // Seed data for first-time visitors or empty state
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      const today = todayISO();
      const tomorrow = toISODate(new Date(Date.now() + 86400000));
      const nextWeek = toISODate(new Date(Date.now() + 86400000 * 5));
      tasks = [
        {
          id: "seed-1",
          title: "Fix login validation",
          date: today,
          description:
            "Regex check on email field is too strict — allows no subdomains.",
          priority: "High",
          status: "todo",
          assignee: "Rahul Sharma",
          createdAt: Date.now() - 3000,
        },
        {
          id: "seed-2",
          title: "Update API documentation",
          date: nextWeek,
          description:
            "v2 endpoints are missing from public developer documentation.",
          priority: "Low",
          status: "todo",
          assignee: "Priya Patel",
          createdAt: Date.now() - 2000,
        },
        {
          id: "seed-3",
          title: "Dashboard layout redesign",
          date: tomorrow,
          description:
            "New layout based on approved Figma design system tokens.",
          priority: "High",
          status: "progress",
          assignee: "Arjun Reddy",
          createdAt: Date.now() - 1000,
        },
        {
          id: "seed-4",
          title: "Setup CI/CD pipeline",
          date: today,
          description:
            "GitHub Actions workflow for staging builds and test suites.",
          priority: "Medium",
          status: "done",
          assignee: "Sneha Iyer",
          createdAt: Date.now(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Migration: backward-compatible defaults for old / legacy data.
    // Preserve existing IDs — only assign new IDs to tasks that lack them.
    tasks = tasks.map((t) => ({
      id:
        t.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: t.title || "Untitled",
      date: t.date || "",
      description: t.description || "",
      priority: t.priority || "Medium",
      status: t.status || "todo",
      assignee: t.assignee || "Unassigned",
      createdAt: t.createdAt || Date.now(),
    }));

    state.tasks = tasks;
  } catch (e) {
    console.error("Failed to load tasks", e);
    state.tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

/* ======================================================================
   Rendering
   ====================================================================== */
function renderTaskCard(t) {
  const pColor =
    t.priority === "High" ? "high" : t.priority === "Medium" ? "medium" : "low";
  const bgColor = getAvatarColor(t.assignee);
  const init = initials(t.assignee);

  return `
    <div class="task-card" data-id="${escapeHtml(t.id)}">
      <div class="task-card-header">
        <span class="priority-badge">
          <span class="priority-dot ${pColor}"></span>
          ${escapeHtml(t.priority)}
        </span>
        <div class="task-actions">
          <button class="btn btn-outline" data-action="edit" data-id="${escapeHtml(t.id)}">Edit</button>
          <button class="btn btn-outline" data-action="delete" data-id="${escapeHtml(t.id)}">Delete</button>
        </div>
      </div>
      <div class="task-title">${escapeHtml(t.title)}</div>
      ${t.date ? `<div class="task-date">Due: ${formatDateDisplay(t.date)}</div>` : ""}
      ${t.description ? `<div class="task-description">${escapeHtml(t.description)}</div>` : ""}
      <div class="task-assignee">
        <div class="avatar" style="background:${bgColor}">${init}</div>
        ${escapeHtml(t.assignee)}
      </div>
    </div>
  `;
}

function renderKanban() {
  const cols = { todo: [], progress: [], done: [] };
  state.tasks.forEach((t) => {
    if (cols[t.status]) cols[t.status].push(t);
  });

  Object.values(cols).forEach((col) =>
    col.sort((a, b) => b.createdAt - a.createdAt),
  );

  const map = {
    todo: { board: boardTodo, count: countTodo },
    progress: { board: boardProgress, count: countProgress },
    done: { board: boardDone, count: countDone },
  };

  ["todo", "progress", "done"].forEach((status) => {
    const { board, count } = map[status];
    count.textContent = cols[status].length;
    board.innerHTML = cols[status].length
      ? cols[status].map(renderTaskCard).join("")
      : `<div class="empty-state">No tasks here</div>`;
  });
}

/**
 * Render calendar month grid.
 * Date math uses the 1st of each month to avoid setMonth day-overflow bugs
 * (e.g., Jan 31 + 1 month = Feb 28, then +1 month = Mar 28 — skipping days).
 */
function renderCalendar() {
  const base = new Date(todayISO() + "T00:00:00");
  base.setMonth(base.getMonth() + state.calendarMonthOffset);
  base.setDate(1); // normalize to 1st to avoid day-overflow drift

  const year = base.getFullYear();
  const month = base.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();
  const today = todayISO();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = dayNames
    .map((d) => `<div class="calendar-day-header">${d}</div>`)
    .join("");

  // Leading blanks
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="calendar-cell"></div>`;
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateStr === today;
    const dayTasks = state.tasks.filter((t) => t.date === dateStr);
    const visible = dayTasks.slice(0, 2);
    const more = dayTasks.length > 2;

    let chipsHtml = visible
      .map((t) => {
        const c =
          t.priority === "High"
            ? "high"
            : t.priority === "Medium"
              ? "medium"
              : "low";
        return `<div class="calendar-chip ${c}" data-task-id="${escapeHtml(t.id)}" title="${escapeHtml(t.title)}">${escapeHtml(t.title)}</div>`;
      })
      .join("");

    const todayCls = isToday ? "today" : "";
    html += `
      <div class="calendar-cell ${todayCls}">
        <div class="calendar-day">${day}</div>
        ${chipsHtml}
        ${more ? `<div class="calendar-more">+${dayTasks.length - 2} more</div>` : ""}
      </div>
    `;
  }

  calendarGrid.innerHTML = html;
  calendarTitle.textContent = base.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function renderAll() {
  renderKanban();
  renderCalendar();
}

function switchView(view) {
  state.view = view;
  viewBtns.forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle("view-btn-active", active);
    btn.setAttribute("aria-pressed", active);
  });
  kanbanView.classList.toggle("hidden", view !== "kanban");
  calendarView.classList.toggle("hidden", view !== "calendar");
  if (view === "calendar") renderCalendar();
}

/* ======================================================================
   Task CRUD
   ====================================================================== */
function openTaskForm(task) {
  // Reset form fields
  tId.value = "";
  tTitle.value = "";
  tDate.value = "";
  tDescription.value = "";
  tPriority.value = "Medium";
  tStatus.value = "todo";
  tAssignee.value = "Unassigned";

  // Clear any field errors
  [tTitle, tDate, tDescription, tPriority, tStatus, tAssignee].forEach((el) => {
    el.classList.remove("error");
  });

  if (task) {
    state.editingId = task.id;
    dialogTitle.textContent = "Edit Task";
    taskFormSave.textContent = "Update Task";
    tId.value = task.id;
    tTitle.value = task.title;
    tDate.value = task.date;
    tDescription.value = task.description;
    tPriority.value = task.priority;
    tStatus.value = task.status;
    tAssignee.value = task.assignee;
  } else {
    state.editingId = null;
    dialogTitle.textContent = "Add Task";
    taskFormSave.textContent = "Add Task";
  }

  taskFormOverlay.classList.remove("hidden");
  taskFormDialog.classList.remove("hidden");
  taskFormDialog.showModal();
}

function closeTaskForm() {
  state.editingId = null;
  taskFormDialog.close();
  taskFormOverlay.classList.add("hidden");
  taskFormDialog.classList.add("hidden");
  tTitle.value = "";
  tDate.value = "";
  tDescription.value = "";
  tPriority.value = "Medium";
  tStatus.value = "todo";
  tAssignee.value = "Unassigned";
  [tTitle, tDate, tDescription, tPriority, tStatus, tAssignee].forEach((el) => {
    el.classList.remove("error");
  });
}

function handleTaskSubmit(e) {
  e.preventDefault();

  let valid = true;
  if (!tTitle.value.trim()) {
    tTitle.classList.add("error");
    tTitle.focus();
    valid = false;
  } else {
    tTitle.classList.remove("error");
  }

  if (!valid) return;

  const existing = state.editingId
    ? state.tasks.find((t) => t.id === state.editingId)
    : null;

  const task = {
    id:
      state.editingId ||
      `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: tTitle.value.trim(),
    date: tDate.value,
    description: tDescription.value.trim(),
    priority: tPriority.value,
    status: tStatus.value,
    assignee: tAssignee.value,
    createdAt: existing ? existing.createdAt : Date.now(),
  };

  const wasEditing = !!state.editingId;

  if (state.editingId) {
    const idx = state.tasks.findIndex((t) => t.id === state.editingId);
    if (idx !== -1) state.tasks[idx] = task;
  } else {
    state.tasks.unshift(task);
  }

  saveTasks();
  renderAll();
  closeTaskForm();
  showToast(wasEditing ? "Task updated." : "Task added.");
}

function deleteTask(id) {
  showConfirm(
    "Delete Task",
    "Are you sure you want to delete this task?",
    () => {
      state.tasks = state.tasks.filter((t) => t.id !== id);
      saveTasks();
      renderAll();
      hideConfirm();
      showToast("Task deleted.");
    },
  );
}

function resetDemo() {
  showConfirm(
    "Reset Demo",
    "This will clear current tasks and restore sample sprint tasks. Continue?",
    () => {
      localStorage.removeItem(STORAGE_KEY);
      loadTasks();
      renderAll();
      hideConfirm();
      showToast("Demo restored with sample tasks.");
    },
  );
}

/* ======================================================================
   Event Delegation
   ====================================================================== */
function bindBoardEvents() {
  [boardTodo, boardProgress, boardDone].forEach((board) => {
    board.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === "edit") {
        const task = state.tasks.find((t) => t.id === id);
        if (task) openTaskForm(task);
      } else if (action === "delete") {
        deleteTask(id);
      }
    });
  });

  calendarGrid.addEventListener("click", (e) => {
    const chip = e.target.closest(".calendar-chip");
    if (!chip) return;
    const id = chip.dataset.taskId;
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      switchView("kanban");
      openTaskForm(task);
    }
  });
}

/* ======================================================================
   UI Behaviors
   ====================================================================== */

/** Scroll-spy: highlights active nav link based on scroll position. */
function updateScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  let current = null;

  sections.forEach((section) => {
    const top = window.scrollY;
    const offsetTop = section.offsetTop - 80;
    const offsetBottom = offsetTop + section.offsetHeight;

    if (top >= offsetTop && top < offsetBottom) {
      current = section.getAttribute("id");
    }
  });

  navLinks.querySelectorAll("a[data-section]").forEach((link) => {
    if (link.dataset.section === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function bindUI() {
  /* Navbar scroll shadow + scroll-spy */

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
    updateScrollSpy();
  });

  /* Hamburger toggle (mobile) */
  navHamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navHamburger.setAttribute("aria-expanded", open);
  });

  /* Close mobile menu on link click */
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navHamburger.setAttribute("aria-expanded", "false");
    });
  });

  /* View toggle: Kanban <-> Calendar */
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  /* Open task form (Add) */
  openTaskFormBtn.addEventListener("click", () => openTaskForm(null));

  /* Close task form dialog */
  taskFormClose.addEventListener("click", closeTaskForm);
  taskFormCancel.addEventListener("click", closeTaskForm);
  taskFormOverlay.addEventListener("click", closeTaskForm);

  /* Prevent overlay close when clicking inside dialog */
  taskFormDialog.addEventListener("click", (e) => e.stopPropagation());

  /* Task form submit */
  taskFormInner.addEventListener("submit", handleTaskSubmit);

  /* Clear field error on input */
  [tTitle, tDate, tDescription, tPriority, tStatus, tAssignee].forEach((el) => {
    el.addEventListener("input", () => el.classList.remove("error"));
  });

  /* Reset demo */
  resetDemoBtn.addEventListener("click", resetDemo);

  /* Calendar navigation */
  calPrev.addEventListener("click", () => {
    state.calendarMonthOffset--;
    renderCalendar();
  });
  calNext.addEventListener("click", () => {
    state.calendarMonthOffset++;
    renderCalendar();
  });

  /* Confirm dialog controls */
  confirmClose.addEventListener("click", hideConfirm);
  confirmCancel.addEventListener("click", hideConfirm);
  confirmOverlay.addEventListener("click", hideConfirm);
  confirmDialog.addEventListener("click", (e) => e.stopPropagation());

  confirmConfirm.addEventListener("click", () => {
    if (state.confirmCallback) {
      const cb = state.confirmCallback;
      state.confirmCallback = null;
      cb();
    } else {
      hideConfirm();
    }
  });

  /* ======================================================================
     Contact form validation
     ====================================================================== */
  const cfName = document.getElementById("cf-name");
  const cfEmail = document.getElementById("cf-email");
  const cfNameError = document.getElementById("cf-name-error");
  const cfEmailError = document.getElementById("cf-email-error");

  function validateContact() {
    let ok = true;

    if (!cfName.value.trim()) {
      cfNameError.textContent = "Name is required";
      ok = false;
    } else {
      cfNameError.textContent = "";
    }

    const email = cfEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      cfEmailError.textContent = "Valid email required";
      ok = false;
    } else {
      cfEmailError.textContent = "";
    }

    return ok;
  }

  cfName.addEventListener("input", () => {
    if (cfName.value.trim()) cfNameError.textContent = "";
  });
  cfEmail.addEventListener("input", () => {
    if (cfEmail.value.trim()) cfEmailError.textContent = "";
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateContact()) return;

    const submittedName = cfName.value.trim() || "there";
    cfSubmit.textContent = "Sending...";
    cfSubmit.disabled = true;

    setTimeout(() => {
      cfSubmit.textContent = "Send Message";
      cfSubmit.disabled = false;
      cfToastName.textContent = submittedName;
      contactForm.reset();
      cfToast.classList.remove("hidden");
      setTimeout(() => cfToast.classList.add("hidden"), 4000);
    }, 800);
  });
}

/* ======================================================================
   Init
   ====================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  bindBoardEvents();
  bindUI();
  updateScrollSpy();
  renderAll();
});
