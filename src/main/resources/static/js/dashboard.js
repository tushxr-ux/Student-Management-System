/**
 * Student Management System - Dashboard Controller
 * Modern reactive frontend logic without external framework dependencies.
 */

// Application State
const state = {
  students: [],
  searchQuery: '',
  filterCourse: 'ALL',
  viewMode: 'table', // 'table' | 'grid'
  currentEditingId: null,
  pendingDeleteId: null
};

// Deterministic Gradient Palettes for Avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #0ea5e9)'
];

// Helper: Get Initials from Name
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper: Get Avatar Gradient
function getAvatarGradient(id) {
  const index = Math.abs(id) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

// Helper: Get Course Badge CSS Class
function getCourseBadgeClass(course) {
  if (!course) return 'badge-default';
  const c = course.toLowerCase();
  if (c.includes('computer') || c.includes('software')) return 'badge-cs';
  if (c.includes('information') || c.includes('it') || c.includes('network')) return 'badge-it';
  if (c.includes('data') || c.includes('ai') || c.includes('machine')) return 'badge-ds';
  return 'badge-default';
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') {
    iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
  } else if (type === 'info') {
    iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconHtml}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, duration);
}

// Utility: Escape HTML to avoid injection
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================================
// API CLIENT
// ==========================================================================
async function fetchStudents() {
  const loadingIndicator = document.getElementById('loadingSpinner');
  if (loadingIndicator) loadingIndicator.style.display = 'block';

  try {
    const res = await fetch('/students');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    state.students = Array.isArray(data) ? data : [];
    updateBackendStatus(true);
    renderAll();
  } catch (error) {
    console.error('Failed to load students:', error);
    updateBackendStatus(false);
    showToast('error', 'Connection Error', 'Could not retrieve students from server.');
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

async function apiAddStudent(student) {
  const res = await fetch('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: 'Could not create student' }));
    throw new Error(errData.message || `Error ${res.status}`);
  }

  return await res.json();
}

async function apiUpdateStudent(id, student) {
  const res = await fetch(`/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: 'Could not update student' }));
    throw new Error(errData.message || `Error ${res.status}`);
  }

  return await res.json();
}

async function apiDeleteStudent(id) {
  const res = await fetch(`/students/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Deletion failed');
    throw new Error(text || `Error ${res.status}`);
  }

  return true;
}

// ==========================================================================
// RENDER METHODS
// ==========================================================================
function getFilteredStudents() {
  return state.students.filter(student => {
    const matchesSearch =
      !state.searchQuery ||
      student.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      String(student.id).includes(state.searchQuery);

    const matchesCourse =
      state.filterCourse === 'ALL' ||
      student.course === state.filterCourse;

    return matchesSearch && matchesCourse;
  });
}

function renderAll() {
  updateKPIs();
  updateCourseFilterDropdown();
  renderStudentList();
}

function updateBackendStatus(isOnline) {
  const pill = document.getElementById('backendStatusPill');
  if (!pill) return;
  if (isOnline) {
    pill.innerHTML = `<span class="status-dot"></span> System Live`;
    pill.style.color = 'var(--color-emerald)';
  } else {
    pill.innerHTML = `<span class="status-dot" style="background:#ef4444;box-shadow:none;"></span> Disconnected`;
    pill.style.color = '#ef4444';
  }
}

function updateKPIs() {
  const total = state.students.length;
  const coursesSet = new Set(state.students.map(s => s.course));
  const uniqueCourses = coursesSet.size;

  // Find top course
  const counts = {};
  state.students.forEach(s => {
    counts[s.course] = (counts[s.course] || 0) + 1;
  });
  let topCourse = 'N/A';
  let maxCount = 0;
  for (const [course, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      topCourse = course;
    }
  }

  // Next suggested ID
  const nextId = total > 0 ? Math.max(...state.students.map(s => s.id)) + 1 : 101;

  const totalEl = document.getElementById('kpiTotalStudents');
  if (totalEl) totalEl.textContent = total;

  const courseEl = document.getElementById('kpiTotalCourses');
  if (courseEl) courseEl.textContent = uniqueCourses;

  const topCourseEl = document.getElementById('kpiTopCourse');
  if (topCourseEl) {
    topCourseEl.textContent = total > 0 ? topCourse : 'None';
    topCourseEl.title = topCourse;
  }

  const nextIdEl = document.getElementById('kpiNextId');
  if (nextIdEl) nextIdEl.textContent = `#${nextId}`;
}

function updateCourseFilterDropdown() {
  const select = document.getElementById('courseFilterSelect');
  if (!select) return;

  const currentVal = state.filterCourse;
  const courses = Array.from(new Set(state.students.map(s => s.course))).sort();

  let html = '<option value="ALL">All Courses</option>';
  courses.forEach(c => {
    const isSelected = c === currentVal ? 'selected' : '';
    html += `<option value="${escapeHtml(c)}" ${isSelected}>${escapeHtml(c)}</option>`;
  });
  select.innerHTML = html;
}

function renderStudentList() {
  const filtered = getFilteredStudents();
  const tableContainer = document.getElementById('tableContainer');
  const cardsContainer = document.getElementById('cardsContainer');
  const emptyState = document.getElementById('emptyState');
  const studentCountLabel = document.getElementById('studentCountLabel');

  if (studentCountLabel) {
    studentCountLabel.textContent = `Showing ${filtered.length} of ${state.students.length} students`;
  }

  if (filtered.length === 0) {
    if (tableContainer) tableContainer.style.display = 'none';
    if (cardsContainer) cardsContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (state.viewMode === 'table') {
    if (tableContainer) tableContainer.style.display = 'block';
    if (cardsContainer) cardsContainer.style.display = 'none';
    renderTableRows(filtered);
  } else {
    if (tableContainer) tableContainer.style.display = 'none';
    if (cardsContainer) cardsContainer.style.display = 'grid';
    renderCards(filtered);
  }
}

function renderTableRows(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;

  tbody.innerHTML = students.map(student => {
    const initials = getInitials(student.name);
    const gradient = getAvatarGradient(student.id);
    const badgeClass = getCourseBadgeClass(student.course);

    return `
      <tr>
        <td>
          <div class="student-profile">
            <div class="student-avatar" style="background: ${gradient}">
              ${initials}
            </div>
            <div>
              <div class="student-name-text">${escapeHtml(student.name)}</div>
              <span class="id-badge"><i class="fa-solid fa-hashtag" style="font-size:0.75rem;opacity:0.6;"></i>${student.id}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="course-badge ${badgeClass}">
            <i class="fa-solid fa-graduation-cap"></i>
            ${escapeHtml(student.course)}
          </span>
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="action-btn action-edit" onclick="handleOpenEditModal(${student.id})">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="action-btn action-delete" onclick="handleOpenDeleteModal(${student.id})">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCards(students) {
  const container = document.getElementById('cardsContainer');
  if (!container) return;

  container.innerHTML = students.map(student => {
    const initials = getInitials(student.name);
    const gradient = getAvatarGradient(student.id);
    const badgeClass = getCourseBadgeClass(student.course);

    return `
      <div class="student-card">
        <div>
          <div class="card-top">
            <div class="student-avatar" style="background: ${gradient}">
              ${initials}
            </div>
            <span class="id-badge">ID: ${student.id}</span>
          </div>
          <div class="card-body-content">
            <h3 class="card-student-name">${escapeHtml(student.name)}</h3>
            <span class="course-badge ${badgeClass}">
              <i class="fa-solid fa-graduation-cap"></i>
              ${escapeHtml(student.course)}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="handleOpenEditModal(${student.id})">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="handleOpenDeleteModal(${student.id})">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// MODAL CONTROLLERS
// ==========================================================================
function handleOpenAddModal() {
  state.currentEditingId = null;
  const form = document.getElementById('studentModalForm');
  if (form) form.reset();

  const title = document.getElementById('modalTitleText');
  if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color:var(--color-indigo)"></i> Add New Student';

  const idInput = document.getElementById('modalStudentId');
  if (idInput) {
    idInput.disabled = false;
    // Suggest next available ID
    const nextId = state.students.length > 0 ? Math.max(...state.students.map(s => s.id)) + 1 : 101;
    idInput.value = nextId;
  }

  const submitBtn = document.getElementById('modalSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Create Student';
    submitBtn.className = 'btn btn-primary';
  }

  openModal('studentModal');
  setTimeout(() => {
    const nameInput = document.getElementById('modalStudentName');
    if (nameInput) nameInput.focus();
  }, 100);
}

function handleOpenEditModal(id) {
  const student = state.students.find(s => s.id === id);
  if (!student) return;

  state.currentEditingId = id;

  const title = document.getElementById('modalTitleText');
  if (title) title.innerHTML = '<i class="fa-solid fa-user-pen" style="color:var(--color-amber)"></i> Edit Student Details';

  const idInput = document.getElementById('modalStudentId');
  if (idInput) {
    idInput.value = student.id;
    idInput.disabled = true; // ID cannot be changed in standard REST PUT
  }

  const nameInput = document.getElementById('modalStudentName');
  if (nameInput) nameInput.value = student.name;

  const courseInput = document.getElementById('modalStudentCourse');
  if (courseInput) courseInput.value = student.course;

  const submitBtn = document.getElementById('modalSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Save Changes';
    submitBtn.className = 'btn btn-warning';
  }

  openModal('studentModal');
}

function handleOpenDeleteModal(id) {
  const student = state.students.find(s => s.id === id);
  if (!student) return;

  state.pendingDeleteId = id;

  const nameEl = document.getElementById('deleteTargetName');
  if (nameEl) nameEl.textContent = `"${student.name}" (ID: ${student.id})`;

  openModal('deleteModal');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==========================================================================
// FORM SUBMISSION & DELETION ACTIONS
// ==========================================================================
async function handleModalFormSubmit(event) {
  event.preventDefault();

  const idInput = document.getElementById('modalStudentId');
  const nameInput = document.getElementById('modalStudentName');
  const courseInput = document.getElementById('modalStudentCourse');

  const id = parseInt(idInput.value, 10);
  const name = nameInput.value.trim();
  const course = courseInput.value.trim();

  if (isNaN(id) || !name || !course) {
    showToast('error', 'Validation Error', 'Please provide valid values for all fields.');
    return;
  }

  const submitBtn = document.getElementById('modalSubmitBtn');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    if (state.currentEditingId === null) {
      // Adding new student
      await apiAddStudent({ id, name, course });
      showToast('success', 'Student Enrolled', `${name} has been added successfully!`);
    } else {
      // Updating existing student
      await apiUpdateStudent(state.currentEditingId, { id, name, course });
      showToast('success', 'Profile Updated', `${name}'s details were updated.`);
    }

    closeModal('studentModal');
    await fetchStudents();
  } catch (error) {
    showToast('error', 'Request Failed', error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
}

async function handleConfirmDelete() {
  if (state.pendingDeleteId === null) return;

  const id = state.pendingDeleteId;
  const deleteBtn = document.getElementById('confirmDeleteBtn');
  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
  }

  try {
    await apiDeleteStudent(id);
    showToast('success', 'Student Removed', `Student #${id} was deleted.`);
    closeModal('deleteModal');
    await fetchStudents();
  } catch (error) {
    showToast('error', 'Deletion Failed', error.message);
  } finally {
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete Student';
    }
    state.pendingDeleteId = null;
  }
}

// ==========================================================================
// EXPORT DATA (CSV)
// ==========================================================================
function exportStudentsToCSV() {
  if (!state.students || state.students.length === 0) {
    showToast('info', 'No Data', 'There are no students to export.');
    return;
  }

  const headers = ['ID', 'Name', 'Course'];
  const rows = state.students.map(s => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.course.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `students_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('info', 'Export Complete', 'Student list downloaded as CSV.');
}

// ==========================================================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderStudentList();
    });
  }

  // Course Filter
  const courseFilter = document.getElementById('courseFilterSelect');
  if (courseFilter) {
    courseFilter.addEventListener('change', (e) => {
      state.filterCourse = e.target.value;
      renderStudentList();
    });
  }

  // View Mode Toggles
  const tableViewBtn = document.getElementById('tableViewBtn');
  const cardViewBtn = document.getElementById('cardViewBtn');

  if (tableViewBtn && cardViewBtn) {
    tableViewBtn.addEventListener('click', () => {
      state.viewMode = 'table';
      tableViewBtn.classList.add('active');
      cardViewBtn.classList.remove('active');
      renderStudentList();
    });

    cardViewBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      cardViewBtn.classList.add('active');
      tableViewBtn.classList.remove('active');
      renderStudentList();
    });
  }

  // Modal Form Submit
  const studentForm = document.getElementById('studentModalForm');
  if (studentForm) {
    studentForm.addEventListener('submit', handleModalFormSubmit);
  }

  // Confirm Delete Action
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  }

  // Close Modals on Backdrop click or escape key
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('studentModal');
      closeModal('deleteModal');
    }
  });

  // Initial Fetch
  fetchStudents();
});
