// DATA MODEL
let appData = { exams: [] };
let currentChart = null;

function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
}

// ========== BEAUTIFUL NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '16px 24px';
  notification.style.borderRadius = '12px';
  notification.style.fontWeight = '500';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '12px';
  notification.style.minWidth = '280px';
  notification.style.maxWidth = '400px';
  notification.style.animation = 'slideInRight 0.3s ease';
  notification.style.backdropFilter = 'blur(10px)';
  
  let icon = '';
  let bgColor = '';
  
  switch(type) {
    case 'success':
      icon = '✅';
      bgColor = 'linear-gradient(135deg, #10b981, #059669)';
      break;
    case 'error':
      icon = '❌';
      bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
      break;
    case 'warning':
      icon = '⚠️';
      bgColor = 'linear-gradient(135deg, #f59e0b, #d97706)';
      break;
    case 'info':
      icon = 'ℹ️';
      bgColor = 'linear-gradient(135deg, #3b82f6, #2563eb)';
      break;
    case 'edit':
      icon = '✏️';
      bgColor = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      break;
    default:
      icon = '✅';
      bgColor = 'linear-gradient(135deg, #10b981, #059669)';
  }
  
  notification.style.background = bgColor;
  notification.style.color = 'white';
  notification.innerHTML = `${icon} <span style="flex:1">${message}</span>`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 0.2s ease;
  }
  
  .modal-content {
    background: var(--bg-card);
    border-radius: 1.5rem;
    padding: 2rem;
    min-width: 320px;
    max-width: 450px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: scaleIn 0.2s ease;
    border: 1px solid var(--border-light);
  }
  
  .modal-content h3 {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1.3rem;
  }
  
  .modal-content input {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border-light);
    background: var(--bg-card);
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .modal-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
  
  .modal-buttons button {
    padding: 0.5rem 1.2rem;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Modal functions
function showEditModal(currentValue, onSave, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'modal-content';
  
  modal.innerHTML = `
    <h3>${title}</h3>
    <input type="text" id="editInput" value="${escapeHtml(currentValue)}" placeholder="Enter new name...">
    <div class="modal-buttons">
      <button class="btn-outline" id="cancelEditBtn">Cancel</button>
      <button id="saveEditBtn">Save</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  const input = modal.querySelector('#editInput');
  input.focus();
  input.select();
  
  const saveBtn = modal.querySelector('#saveEditBtn');
  const cancelBtn = modal.querySelector('#cancelEditBtn');
  
  const closeModal = () => overlay.remove();
  
  saveBtn.onclick = () => {
    const newValue = input.value.trim();
    if (newValue) {
      onSave(newValue);
      closeModal();
    } else {
      showNotification('Please enter a valid name', 'warning');
    }
  };
  
  cancelBtn.onclick = closeModal;
  
  input.onkeypress = (e) => {
    if (e.key === 'Enter') saveBtn.click();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

function loadData() {
  const stored = localStorage.getItem('examSyllabusTrackerAdvanced');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.exams) appData = parsed;
    } catch(e) { }
  }
  if (appData.exams.length === 0) {
    appData.exams = [{
      id: generateId(),
      name: "UPSC Civil Services",
      subjects: [
        {
          id: generateId(),
          name: "History",
          topics: [
            { id: generateId(), name: "Modern Indian History", completed: false },
            { id: generateId(), name: "World History", completed: true }
          ]
        },
        {
          id: generateId(),
          name: "Polity",
          topics: [
            { id: generateId(), name: "Constitution of India", completed: false },
            { id: generateId(), name: "Governance", completed: false }
          ]
        }
      ]
    }];
  }
  persistData();
}

function persistData() {
  localStorage.setItem('examSyllabusTrackerAdvanced', JSON.stringify(appData));
}

function getExamById(examId) {
  return appData.exams.find(e => e.id === examId);
}

function subjectProgress(topics) {
  if (!topics.length) return 0;
  return (topics.filter(t => t.completed).length / topics.length) * 100;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// RENDER EXAMS
function renderExams() {
  const container = document.getElementById('examsContainer');
  if (!appData.exams.length) {
    container.innerHTML = '<div class="empty-msg">📭 No exams created. Add your first exam!</div>';
    updateDropdowns();
    refreshReport();
    return;
  }
  container.innerHTML = '';
  appData.exams.forEach(exam => {
    const examDiv = document.createElement('div');
    examDiv.className = 'exam-card';
    examDiv.innerHTML = `
      <div class="exam-header">
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <span class="exam-name">📘 ${escapeHtml(exam.name)}</span>
          <button class="btn-outline btn-sm edit-exam-btn" data-exam-id="${exam.id}" style="padding: 0.2rem 0.8rem;">✏️ Edit</button>
        </div>
        <button class="btn-danger delete-exam-btn" data-exam-id="${exam.id}">🗑 Delete Exam</button>
      </div>
      <div class="subjects-area"></div>
    `;
    const subjectsArea = examDiv.querySelector('.subjects-area');
    if (exam.subjects.length === 0) {
      subjectsArea.innerHTML = '<div style="padding:0.5rem; opacity:0.7;">No subjects yet. Add subjects using the form.</div>';
    } else {
      exam.subjects.forEach(subject => {
        const progressPercent = subjectProgress(subject.topics);
        const subDiv = document.createElement('div');
        subDiv.className = 'subject-item';
        subDiv.innerHTML = `
          <div class="subject-title">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
              <span><strong>📌 ${escapeHtml(subject.name)}</strong> (${progressPercent.toFixed(0)}% | ${subject.topics.filter(t => t.completed).length}/${subject.topics.length} topics)</span>
              <button class="btn-outline btn-sm edit-subject-btn" data-exam-id="${exam.id}" data-subject-id="${subject.id}" style="padding: 0.2rem 0.6rem;">✏️ Edit</button>
            </div>
            <button class="btn-outline btn-sm delete-subject-btn" data-exam-id="${exam.id}" data-subject-id="${subject.id}">✖ Subject</button>
          </div>
          <ul class="topic-list"></ul>
          <div class="add-topic-inline">
            <input type="text" placeholder="New topic name" class="inline-topic-input" data-subject-id="${subject.id}">
            <button class="btn-sm inline-add-topic" data-exam-id="${exam.id}" data-subject-id="${subject.id}">+ Add Topic</button>
          </div>
        `;
        const topicList = subDiv.querySelector('.topic-list');
        if (subject.topics.length === 0) {
          topicList.innerHTML = '<li style="list-style:none; opacity:0.6;">✨ No topics yet</li>';
        } else {
          subject.topics.forEach(topic => {
            const li = document.createElement('li');
            li.className = 'topic-item';
            li.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
                <span>📖 ${escapeHtml(topic.name)}</span>
                <button class="btn-outline btn-sm edit-topic-btn" data-exam-id="${exam.id}" data-subject-id="${subject.id}" data-topic-id="${topic.id}" style="padding: 0.2rem 0.5rem; font-size: 0.65rem;">✏️ Edit</button>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <span class="status-badge ${topic.completed ? 'status-complete' : 'status-pending'}">${topic.completed ? '✓ Completed' : '○ Pending'}</span>
                <button class="toggle-topic-btn" data-exam-id="${exam.id}" data-subject-id="${subject.id}" data-topic-id="${topic.id}" style="padding:0.2rem 0.7rem;">🔄 Toggle</button>
                <button class="delete-topic-btn" data-exam-id="${exam.id}" data-subject-id="${subject.id}" data-topic-id="${topic.id}" style="background:var(--danger); padding:0.2rem 0.6rem;">🗑</button>
              </div>
            `;
            topicList.appendChild(li);
          });
        }
        subjectsArea.appendChild(subDiv);
      });
    }
    container.appendChild(examDiv);
  });
  attachEvents();
  updateDropdowns();
  refreshReport();
}

function attachEvents() {
  // Edit exam event
  document.querySelectorAll('.edit-exam-btn').forEach(btn => {
    btn.onclick = () => {
      const examId = btn.dataset.examId;
      const exam = getExamById(examId);
      if (exam) {
        showEditModal(exam.name, (newName) => {
          const oldName = exam.name;
          exam.name = newName;
          persistData();
          renderExams();
          showNotification(`Exam "${oldName}" renamed to "${newName}"`, 'edit');
        }, 'Edit Exam Name');
      }
    };
  });
  
  // Edit subject event
  document.querySelectorAll('.edit-subject-btn').forEach(btn => {
    btn.onclick = () => {
      const examId = btn.dataset.examId;
      const subjectId = btn.dataset.subjectId;
      const exam = getExamById(examId);
      const subject = exam?.subjects.find(s => s.id === subjectId);
      if (subject) {
        showEditModal(subject.name, (newName) => {
          const oldName = subject.name;
          subject.name = newName;
          persistData();
          renderExams();
          showNotification(`Subject "${oldName}" renamed to "${newName}"`, 'edit');
        }, 'Edit Subject Name');
      }
    };
  });
  
  // Edit topic event
  document.querySelectorAll('.edit-topic-btn').forEach(btn => {
    btn.onclick = () => {
      const examId = btn.dataset.examId;
      const subjectId = btn.dataset.subjectId;
      const topicId = btn.dataset.topicId;
      const exam = getExamById(examId);
      const subject = exam?.subjects.find(s => s.id === subjectId);
      const topic = subject?.topics.find(t => t.id === topicId);
      if (topic) {
        showEditModal(topic.name, (newName) => {
          const oldName = topic.name;
          topic.name = newName;
          persistData();
          renderExams();
          showNotification(`Topic "${oldName}" renamed to "${newName}"`, 'edit');
        }, 'Edit Topic Name');
      }
    };
  });
  
  // Delete exam event
  document.querySelectorAll('.delete-exam-btn').forEach(btn => {
    btn.onclick = () => {
      const examId = btn.dataset.examId;
      const examName = getExamById(examId)?.name || 'Exam';
      if (confirm(`Delete "${examName}" and all its subjects/topics?`)) {
        appData.exams = appData.exams.filter(e => e.id !== examId);
        persistData();
        renderExams();
        showNotification(`Exam "${examName}" has been deleted`, 'error');
      }
    };
  });
  
  // Delete subject event
  document.querySelectorAll('.delete-subject-btn').forEach(btn => {
    btn.onclick = () => {
      const exam = getExamById(btn.dataset.examId);
      const subject = exam?.subjects.find(s => s.id === btn.dataset.subjectId);
      if (exam && subject && confirm(`Delete subject "${subject.name}" and all its topics?`)) {
        exam.subjects = exam.subjects.filter(s => s.id !== btn.dataset.subjectId);
        persistData();
        renderExams();
        showNotification(`Subject "${subject.name}" has been deleted`, 'error');
      }
    };
  });
  
  // Toggle topic event
  document.querySelectorAll('.toggle-topic-btn').forEach(btn => {
    btn.onclick = () => {
      const exam = getExamById(btn.dataset.examId);
      const subject = exam?.subjects.find(s => s.id === btn.dataset.subjectId);
      const topic = subject?.topics.find(t => t.id === btn.dataset.topicId);
      if (topic) {
        topic.completed = !topic.completed;
        persistData();
        renderExams();
        const status = topic.completed ? 'completed' : 'marked as pending';
        showNotification(`Topic "${topic.name}" ${status}`, 'info');
      }
    };
  });
  
  // Delete topic event
  document.querySelectorAll('.delete-topic-btn').forEach(btn => {
    btn.onclick = () => {
      const exam = getExamById(btn.dataset.examId);
      const subject = exam?.subjects.find(s => s.id === btn.dataset.subjectId);
      const topic = subject?.topics.find(t => t.id === btn.dataset.topicId);
      if (subject && topic && confirm(`Delete topic "${topic.name}"?`)) {
        subject.topics = subject.topics.filter(t => t.id !== btn.dataset.topicId);
        persistData();
        renderExams();
        showNotification(`Topic "${topic.name}" has been deleted`, 'error');
      }
    };
  });
  
  // Inline add topic event
  document.querySelectorAll('.inline-add-topic').forEach(btn => {
    btn.onclick = () => {
      const exam = getExamById(btn.dataset.examId);
      const subject = exam?.subjects.find(s => s.id === btn.dataset.subjectId);
      const input = document.querySelector(`.inline-topic-input[data-subject-id="${btn.dataset.subjectId}"]`);
      const topicName = input?.value.trim();
      if (subject && topicName) {
        subject.topics.push({ id: generateId(), name: topicName, completed: false });
        persistData();
        renderExams();
        input.value = '';
        showNotification(`Topic "${topicName}" added to "${subject.name}"`, 'success');
      } else if (!topicName) {
        showNotification('Please enter a topic name', 'warning');
      }
    };
  });
}

function updateDropdowns() {
  const examSelect = document.getElementById('examSelectForTopic');
  const subjectSelect = document.getElementById('subjectSelectForTopic');
  const reportSelect = document.getElementById('reportExamSelect');
  
  if (!examSelect) return;
  
  examSelect.innerHTML = '<option value="">-- Choose Exam --</option>';
  reportSelect.innerHTML = '<option value="">-- Select Exam --</option>';
  
  appData.exams.forEach(exam => {
    examSelect.innerHTML += `<option value="${exam.id}">${escapeHtml(exam.name)}</option>`;
    reportSelect.innerHTML += `<option value="${exam.id}">${escapeHtml(exam.name)}</option>`;
  });
  
  if (appData.exams.length > 0) {
    examSelect.value = appData.exams[0].id;
    reportSelect.value = appData.exams[0].id;
    updateSubjectDropdown(examSelect.value);
    refreshReport();
  } else {
    subjectSelect.innerHTML = '<option value="">-- No exams available --</option>';
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
    const ctx = document.getElementById('progressChart').getContext('2d');
    ctx.clearRect(0, 0, 400, 200);
    document.getElementById('reportPreview').innerHTML = '📭 No exams available. Please create an exam first.';
  }
  
  examSelect.onchange = () => {
    if (examSelect.value) {
      updateSubjectDropdown(examSelect.value);
    } else {
      subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    }
  };
  
  reportSelect.onchange = () => {
    refreshReport();
  };
}

function updateSubjectDropdown(examId) {
  const subjectSelect = document.getElementById('subjectSelectForTopic');
  const exam = getExamById(examId);
  subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
  if (exam && exam.subjects.length > 0) {
    exam.subjects.forEach(sub => {
      subjectSelect.innerHTML += `<option value="${sub.id}">${escapeHtml(sub.name)}</option>`;
    });
  } else if (exam) {
    subjectSelect.innerHTML = '<option value="">-- No subjects yet --</option>';
  }
}

// ADD EXAM
document.getElementById('addExamBtn').onclick = () => {
  const name = document.getElementById('examNameInput').value.trim();
  if (!name) {
    showNotification('Please enter an exam name', 'warning');
    return;
  }
  if (appData.exams.some(e => e.name.toLowerCase() === name.toLowerCase())) {
    showNotification('Exam already exists!', 'error');
    return;
  }
  
  const newExam = { id: generateId(), name: name, subjects: [] };
  appData.exams.push(newExam);
  persistData();
  renderExams();
  document.getElementById('examNameInput').value = '';
  showNotification(`✨ Exam "${name}" created successfully!`, 'success');
  
  setTimeout(() => {
    const examSelect = document.getElementById('examSelectForTopic');
    if (examSelect) {
      examSelect.value = newExam.id;
      updateSubjectDropdown(newExam.id);
    }
    const reportSelect = document.getElementById('reportExamSelect');
    if (reportSelect) {
      reportSelect.value = newExam.id;
      refreshReport();
    }
  }, 100);
};

// ADD SUBJECT
document.getElementById('addSubjectBtn').onclick = () => {
  const examId = document.getElementById('examSelectForTopic').value;
  const name = document.getElementById('newSubjectName').value.trim();
  if (!examId) {
    showNotification('Please select an exam first', 'warning');
    return;
  }
  if (!name) {
    showNotification('Please enter a subject name', 'warning');
    return;
  }
  const exam = getExamById(examId);
  if (exam && !exam.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    exam.subjects.push({ id: generateId(), name: name, topics: [] });
    persistData();
    renderExams();
    document.getElementById('newSubjectName').value = '';
    showNotification(`📚 Subject "${name}" added to "${exam.name}"`, 'success');
  } else {
    showNotification('Subject already exists in this exam!', 'error');
  }
};

// ADD TOPIC
document.getElementById('addTopicBtn').onclick = () => {
  const examId = document.getElementById('examSelectForTopic').value;
  const subjectId = document.getElementById('subjectSelectForTopic').value;
  const name = document.getElementById('newTopicName').value.trim();
  if (!examId) {
    showNotification('Please select an exam first', 'warning');
    return;
  }
  if (!subjectId) {
    showNotification('Please select a subject first', 'warning');
    return;
  }
  if (!name) {
    showNotification('Please enter a topic name', 'warning');
    return;
  }
  const exam = getExamById(examId);
  const subject = exam?.subjects.find(s => s.id === subjectId);
  if (subject) {
    subject.topics.push({ id: generateId(), name: name, completed: false });
    persistData();
    renderExams();
    document.getElementById('newTopicName').value = '';
    showNotification(`📖 Topic "${name}" added to "${subject.name}"`, 'success');
  } else {
    showNotification('Subject not found!', 'error');
  }
};

// REFRESH CHART & REPORT
function refreshReport() {
  const reportSelect = document.getElementById('reportExamSelect');
  if (!reportSelect) return;
  
  const examId = reportSelect.value;
  
  if (appData.exams.length === 0 || !examId) {
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
    const ctx = document.getElementById('progressChart').getContext('2d');
    ctx.clearRect(0, 0, 400, 200);
    document.getElementById('reportPreview').innerHTML = '📭 No exams available. Please create an exam first.';
    return;
  }
  
  const exam = getExamById(examId);
  if (!exam) {
    if (appData.exams.length > 0) {
      reportSelect.value = appData.exams[0].id;
      refreshReport();
    }
    return;
  }
  
  const subjectNames = exam.subjects.map(s => s.name);
  const completionData = exam.subjects.map(s => subjectProgress(s.topics));
  
  if (currentChart) currentChart.destroy();
  const ctx = document.getElementById('progressChart').getContext('2d');
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: subjectNames,
      datasets: [{
        label: 'Completion %',
        data: completionData,
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: { 
        y: { 
          max: 100, 
          title: { display: true, text: 'Progress (%)' },
          beginAtZero: true
        } 
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.raw.toFixed(1)}% completed`;
            }
          }
        }
      }
    }
  });
  
  let totalTopics = 0, totalCompleted = 0;
  exam.subjects.forEach(s => {
    totalTopics += s.topics.length;
    totalCompleted += s.topics.filter(t => t.completed).length;
  });
  const overallPercent = totalTopics ? ((totalCompleted / totalTopics) * 100).toFixed(1) : 0;
  
  let html = `<strong>📋 ${escapeHtml(exam.name)} - Progress Report</strong><br><br>`;
  html += `<strong>📊 Overall Progress: ${overallPercent}% (${totalCompleted}/${totalTopics} topics completed)</strong><br><br>`;
  
  if (exam.subjects.length === 0) {
    html += `<em>No subjects added yet. Add subjects to track progress.</em>`;
  } else {
    html += `<strong>📚 Subject-wise Breakdown:</strong><ul>`;
    exam.subjects.forEach(s => {
      const percent = subjectProgress(s.topics).toFixed(0);
      html += `<li><strong>${escapeHtml(s.name)}</strong>: ${percent}% (${s.topics.filter(t => t.completed).length}/${s.topics.length} topics completed)</li>`;
    });
    html += `</ul>`;
  }
  
  html += `<br><i>💡 Tip: Click "Toggle" on any topic to mark it as complete/incomplete.</i>`;
  document.getElementById('reportPreview').innerHTML = html;
}

document.getElementById('refreshReportBtn').onclick = refreshReport;

// PDF GENERATION
async function downloadPDF() {
  const examId = document.getElementById('reportExamSelect').value;
  if (!examId || appData.exams.length === 0) {
    showNotification('Please select an exam first', 'warning');
    return;
  }
  const exam = getExamById(examId);
  if (!exam) {
    showNotification('Exam not found', 'error');
    return;
  }

  const btn = document.getElementById('downloadPdfBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generating PDF...';
  btn.disabled = true;

  try {
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '800px';
    pdfContainer.style.padding = '30px';
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.color = 'black';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '0';
    
    let totalTopics = 0, totalCompleted = 0;
    exam.subjects.forEach(s => {
      totalTopics += s.topics.length;
      totalCompleted += s.topics.filter(t => t.completed).length;
    });
    const overallPercent = totalTopics ? ((totalCompleted / totalTopics) * 100).toFixed(1) : 0;
    
    pdfContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3c72;">📘 Exam Syllabus Report</h1>
        <h2 style="color: #3b82f6;">${escapeHtml(exam.name)}</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <div style="background: #3b82f6; color: white; padding: 15px; border-radius: 10px; margin-top: 15px;">
          <strong>Overall Progress: ${overallPercent}%</strong><br>
          ${totalCompleted} out of ${totalTopics} topics completed
        </div>
      </div>
      <hr>
      <h3>Subject-wise Performance</h3>
      <div id="pdfChartArea" style="margin: 20px 0; text-align: center;">
        <canvas id="pdfCanvas" width="600" height="300"></canvas>
      </div>
      <hr>
      <h3>Detailed Topics Breakdown</h3>
    `;
    
    exam.subjects.forEach(sub => {
      const subPercent = subjectProgress(sub.topics);
      pdfContainer.innerHTML += `
        <div style="margin-bottom: 20px; border-left: 3px solid #3b82f6; padding-left: 15px;">
          <h4 style="color: #3b82f6;">📖 ${escapeHtml(sub.name)} - ${subPercent.toFixed(0)}% complete</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${sub.topics.map(t => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0;">${escapeHtml(t.name)}</td>
                <td style="padding: 8px 0; text-align: right; color: ${t.completed ? '#10b981' : '#ef4444'}; font-weight: bold;">
                  ${t.completed ? '✓ COMPLETED' : '○ PENDING'}
                </td>
              </table>
            `).join('')}
            ${sub.topics.length === 0 ? '<tr><td colspan="2" style="padding: 8px; color: #999;">No topics added</td></tr>' : ''}
          </table>
        </div>
      `;
    });
    
    document.body.appendChild(pdfContainer);
    
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const subjectNames = exam.subjects.map(s => s.name);
    const completionData = exam.subjects.map(s => subjectProgress(s.topics));
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subjectNames,
        datasets: [{
          label: 'Completion %',
          data: completionData,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: false,
        scales: { y: { max: 100, title: { display: true, text: 'Progress (%)' } } }
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const canvas_image = await html2canvas(pdfContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas_image.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 277;
    const imgHeight = (canvas_image.height * imgWidth) / canvas_image.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`${exam.name.replace(/[^a-z0-9]/gi, '_')}_progress_report.pdf`);
    showNotification('PDF report downloaded successfully!', 'success');
    
    chart.destroy();
    document.body.removeChild(pdfContainer);
    
  } catch (error) {
    console.error('PDF error:', error);
    showNotification('Error generating PDF: ' + error.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

document.getElementById('downloadPdfBtn').onclick = downloadPDF;

// DARK MODE
function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'enabled';
  if (isDark) document.body.classList.add('dark');
  updateDarkButton(isDark);
  document.getElementById('darkModeToggle').onclick = () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', dark ? 'enabled' : 'disabled');
    updateDarkButton(dark);
    refreshReport();
  };
}

function updateDarkButton(isDark) {
  const btn = document.getElementById('darkModeToggle');
  if (btn) {
    btn.querySelector('.toggle-icon').innerHTML = isDark ? '☀️' : '🌙';
    btn.querySelector('.toggle-text').innerHTML = isDark ? 'Light Mode' : 'Dark Mode';
  }
}

// INITIALIZATION
loadData();
renderExams();
initDarkMode();
