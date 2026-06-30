// ၁။ LOCAL STORAGE မှ DATA ဖတ်ယူခြင်း (မရှိလျှင် အစမ်းအလုပ်အချို့ ထည့်ပေးထားပါသည်)
let tasks = JSON.parse(localStorage.getItem('perfect_todo_tasks')) || [
    { id: 1, title: "Finish portfolio website 💻", category: "Work", priority: "high", date: "2026-05-25", completed: false },
    { id: 2, title: "Study JavaScript DOM 📖", category: "Study", priority: "high", date: "2026-05-26", completed: false },
    { id: 3, title: "Read 20 pages of book 📖", category: "Personal", priority: "medium", date: "2026-05-27", completed: true }
];

// STATE CONTROLS (လက်ရှိ ဘယ် Menu/Filter/Sort ကို ရွေးထားလဲ မှတ်ထားရန်)
let currentNav = 'all';     // all, today, upcoming, completed
let currentFilter = 'all';  // all, Work, Personal, Study
let isSortedByDate = false;
let editingTaskId = null;   // Edit လုပ်နေတဲ့ Task ID ကို မှတ်ထားရန်

// UI ELEMENTS
const highTaskList = document.getElementById('high-priority-tasks');
const mediumTaskList = document.getElementById('medium-priority-tasks');
const lowTaskList = document.getElementById('low-priority-tasks');
const taskModal = document.getElementById('task-modal');

// ၂။ DATA ကို LOCALSTORAGE ထဲ အမြဲတမ်း သိမ်းမည့် FUNCTION
function saveToStorage() {
    localStorage.setItem('perfect_todo_tasks', JSON.stringify(tasks));
}

// ၃။ UI ပေါ်တွင် TASK များကို အဆင့်ဆင့် စစ်ထုတ်ပြီး ပုံဖော်ပေးမည့် FUNCTION
function renderApp() {
    // အရင် list များကို ရှင်းထုတ်ခြင်း
    highTaskList.innerHTML = '';
    mediumTaskList.innerHTML = '';
    lowTaskList.innerHTML = '';

    let displayTasks = [...tasks];

    // (က) Sidebar Nav အလိုက် စစ်ထုတ်ခြင်း
    const todayStr = new Date().toISOString().split('T')[0]; // ယနေ့ရက်စွဲ
    if (currentNav === 'today') {
        displayTasks = displayTasks.filter(t => t.date === todayStr && !t.completed);
    } else if (currentNav === 'upcoming') {
        displayTasks = displayTasks.filter(t => t.date > todayStr && !t.completed);
    } else if (currentNav === 'completed') {
        displayTasks = displayTasks.filter(t => t.completed);
    }

    // (ခ) Category Filter ခလုတ်များအရ ထပ်မံ စစ်ထုတ်ခြင်း
    if (currentFilter !== 'all') {
        displayTasks = displayTasks.filter(t => t.category === currentFilter);
    }

    // (ဂ) Sort Option အလိုက် စီခြင်း
    if (isSortedByDate) {
        displayTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // (ဃ) HTML အဖြစ် ပြောင်းလဲပြီး သက်ဆိုင်ရာ Priority ထဲ ထည့်ခြင်း
    displayTasks.forEach(task => {
        const itemHTML = `
            <div class="task-item ${task.completed ? 'checked' : ''}">
                <div class="task-left">
                    <div class="custom-checkbox" onclick="toggleTask(${task.id})">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <span class="task-title">${task.title}</span>
                </div>
                <div class="task-right">
                    <span class="task-tag ${task.category.toLowerCase()}">${task.category}</span>
                    <span class="task-date">${task.date}</span>
                    <i class="fa-solid fa-ellipsis-vertical action-menu-btn" onclick="toggleDropdown(event)"></i>
                    
                    <div class="action-dropdown">
                        <button onclick="openEditModal(${task.id})">Edit</button>
                        <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;

        if (task.priority === 'high') highTaskList.innerHTML += itemHTML;
        else if (task.priority === 'medium') mediumTaskList.innerHTML += itemHTML;
        else if (task.priority === 'low') lowTaskList.innerHTML += itemHTML;
    });

    // Priority အကွက်တွေထဲမှာ Task မရှိရင် ထိုအကွက်ကို ခေတ္တ ဖျောက်ထားခြင်း
    document.getElementById('group-high').style.display = highTaskList.children.length ? 'block' : 'none';
    document.getElementById('group-medium').style.display = mediumTaskList.children.length ? 'block' : 'none';
    document.getElementById('group-low').style.display = lowTaskList.children.length ? 'block' : 'none';

    updateMetrics();
}

// ၄။ 📊 STATS CARDS & PROGRESS BAR AUTO တွက်ချက်ခြင်း FUNCTION
function updateMetrics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const inProgress = tasks.filter(t => !t.completed && t.priority === 'high').length;

    document.getElementById('total-tasks-count').innerText = total;
    document.getElementById('pending-tasks-count').innerText = pending;
    document.getElementById('completed-tasks-count').innerText = completed;
    document.getElementById('inprogress-tasks-count').innerText = inProgress;

    // Badges (Sidebar က ဂဏန်းလေးများ) Update လုပ်ခြင်း
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('badge-today').innerText = tasks.filter(t => t.date === todayStr && !t.completed).length;
    document.getElementById('badge-upcoming').innerText = tasks.filter(t => t.date > todayStr && !t.completed).length;
    document.getElementById('badge-completed').innerText = completed;

    // Progress Bar တိုး/လျော့ ရာခိုင်နှုန်းတွက်ချက်ခြင်း
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progress-percent').innerText = `${percent}%`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}

// ၅။ CHECKBOX အမှန်ခြစ်ခြင်း/ဖြုတ်ခြင်း (တကယ် တိုး/လျော့ ဖြစ်စေပါသည်)
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveToStorage();
    renderApp();
}

// ၆။ SIDEBAR NAVIGATION နှိပ်လျှင် အလုပ်လုပ်စေခြင်း
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        currentNav = target.getAttribute('data-nav');
        
        // Header စာသားကို လိုက်ပြောင်းပေးခြင်း
        document.getElementById('page-title').innerText = currentNav === 'all' ? "Let's get things done." : `${currentNav.charAt(0).toUpperCase() + currentNav.slice(1)}Tasks`;
        renderApp();
    });
});

// ၇။ CATEGORY FILTER BUTTONS နှိပ်လျှင် အလုပ်လုပ်စေခြင်း
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderApp();
    });
});

// ၈။ SORT BY DATE BUTTON (နှိပ်လိုက်လျှင် ရက်စွဲအလိုက် စီပေးပါသည်)
document.getElementById('sort-date-btn').addEventListener('click', () => {
    isSortedByDate = !isSortedByDate;
    document.getElementById('sort-label').innerText = isSortedByDate ? "Due Date" : "Default";
    renderApp();
});

// ၉။ EDIT / DELETE ACTION MENU ကို ဖွင့်ခြင်း/ပိတ်ခြင်း
function toggleDropdown(e) {
    e.stopPropagation();
    document.querySelectorAll('.action-dropdown').forEach(d => d.classList.remove('show'));
    e.target.nextElementSibling.classList.toggle('show');
}
window.addEventListener('click', () => document.querySelectorAll('.action-dropdown').forEach(d => d.classList.remove('show')));

// ၁၀။ TASK အသစ်ထည့်ရန် သို့မဟုတ် ပြင်ရန် MODAL FORM ကိုင်တွယ်ပုံများ
document.getElementById('add-task-btn').addEventListener('click', () => {
    editingTaskId = null; // ID ကို ရှင်းထုတ်ထားပါက 'Create' ဟု သတ်မှတ်ပါသည်
    document.getElementById('modal-title').innerText = "Create New Task";
    document.getElementById('task-input-title').value = '';
    document.getElementById('task-input-date').value = new Date().toISOString().split('T')[0];
    taskModal.classList.add('open');
});

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingTaskId = id;
    document.getElementById('modal-title').innerText = "Edit Task Info";
    document.getElementById('task-input-title').value = task.title;
    document.getElementById('task-input-category').value = task.category;
    document.getElementById('task-input-priority').value = task.priority;
    document.getElementById('task-input-date').value = task.date;
    taskModal.classList.add('open');
}

document.getElementById('modal-cancel-btn').addEventListener('click', () => taskModal.classList.remove('open'));

// SAVE BUTTON (အသစ်ထည့်ခြင်းနှင့် တည်းဖြတ်ခြင်း နှစ်ခုစလုံးကို ဤနေရာတွင် လုပ်ဆောင်ပါသည်)
document.getElementById('modal-save-btn').addEventListener('click', () => {
    const title = document.getElementById('task-input-title').value;
    const category = document.getElementById('task-input-category').value;
    const priority = document.getElementById('task-input-priority').value;
    const date = document.getElementById('task-input-date').value;

    if (!title.trim() || !date) return alert("ကျေးဇူးပြု၍ အချက်အလက်များ အပြည့်အစုံ ဖြည့်စွက်ပါ!");

    if (editingTaskId) {
        // Edit Mode
        tasks = tasks.map(t => t.id === editingTaskId ? { ...t, title, category, priority, date } : t);
    } else {
        // Create Mode
        tasks.push({ id: Date.now(), title, category, priority, date, completed: false });
    }

    saveToStorage();
    taskModal.classList.remove('open');
    renderApp();
});

// TASK ဖျက်ပစ်ခြင်း
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage();
    renderApp();
}

// စတင်ပွင့်ချိန်တွင် လုပ်ဆောင်ချက်
document.addEventListener('DOMContentLoaded', renderApp);