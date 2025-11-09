// Check authentication
function checkAuth() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return false;
    }
    document.getElementById('currentUser').textContent = localStorage.getItem('displayName');
    return true;
}

// Logout function
function logout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('displayName');
        window.location.href = 'login.html';
    }
}

// Wait for Firebase to load
window.addEventListener('load', () => {
    if (checkAuth()) {
        // Wait a bit for Firebase to initialize
        setTimeout(() => {
            initApp();
        }, 500);
    }
});

function initApp() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Initialize all features
    initAnniversary();
    initChat();
    initFeelings();
    initMissing();
    initNotes();
    initCalendar();
    
    // Enter key handlers
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Anniversary Counter
function initAnniversary() {
    const anniversaryDate = new Date('2025-10-02T00:00:00'); // 2 ตุลาคม 2568
    
    function updateCounter() {
        const now = new Date();
        const diff = now - anniversaryDate;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
        
        // Calculate next monthly anniversary
        updateNextAnniversary();
    }
    
    function updateNextAnniversary() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Find next occurrence of day 2
        let nextAnniversary = new Date(currentYear, currentMonth, 2);
        
        if (now.getDate() >= 2) {
            // Move to next month
            nextAnniversary = new Date(currentYear, currentMonth + 1, 2);
        }
        
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        
        const nextMonth = thaiMonths[nextAnniversary.getMonth()];
        const nextYear = nextAnniversary.getFullYear() + 543;
        
        document.getElementById('nextAnniversary').textContent = 
            `2 ${nextMonth} ${nextYear}`;
        
        // Calculate days until
        const daysUntil = Math.ceil((nextAnniversary - now) / (1000 * 60 * 60 * 24));
        document.getElementById('countdownText').textContent = 
            `อีก ${daysUntil} วัน`;
    }
    
    updateCounter();
    setInterval(updateCounter, 1000);
}

// Chat System
function initChat() {
    if (!window.db) {
        console.warn('Firebase not ready, retrying...');
        setTimeout(initChat, 1000);
        return;
    }
    
    try {
        const chatMessagesRef = window.dbRef(window.db, 'chats');
        window.dbOnValue(chatMessagesRef, (snapshot) => {
            const messages = snapshot.val();
            displayMessages(messages);
        });
        console.log('Chat system initialized');
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!window.db) {
        alert('กำลังเชื่อมต่อ Firebase... กรุณารอสักครู่');
        return;
    }
    
    const currentUser = localStorage.getItem('loggedInUser');
    const displayName = localStorage.getItem('displayName');
    
    const messageData = {
        text: message,
        sender: currentUser,
        senderName: displayName,
        timestamp: Date.now()
    };
    
    try {
        const chatRef = window.dbRef(window.db, 'chats');
        window.dbPush(chatRef, messageData);
        input.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่');
    }
}

function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!messages) return;
    
    const currentUser = localStorage.getItem('loggedInUser');
    
    Object.entries(messages)
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .forEach(([id, msg]) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
            
            const time = new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageDiv.innerHTML = `
                <div>${msg.text}</div>
                <div class="message-info">${msg.senderName} • ${time}</div>
            `;
            
            container.appendChild(messageDiv);
        });
    
    container.scrollTop = container.scrollHeight;
}

// Feelings System
function initFeelings() {
    if (!window.db) {
        console.warn('Firebase not ready for feelings, retrying...');
        setTimeout(initFeelings, 1000);
        return;
    }
    
    try {
        const feelingsRef = window.dbRef(window.db, 'feelings');
        window.dbOnValue(feelingsRef, (snapshot) => {
            const feelings = snapshot.val();
            displayFeelings(feelings);
        });
        console.log('Feelings system initialized');
    } catch (error) {
        console.error('Error initializing feelings:', error);
    }
}

function saveFeelings() {
    const input = document.getElementById('feelingInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('กรุณาเขียนข้อความก่อน');
        return;
    }
    
    if (!window.db) {
        alert('กำลังเชื่อมต่อ Firebase... กรุณารอสักครู่');
        return;
    }
    
    const currentUser = localStorage.getItem('loggedInUser');
    const displayName = localStorage.getItem('displayName');
    
    const feelingData = {
        text: text,
        author: currentUser,
        authorName: displayName,
        timestamp: Date.now()
    };
    
    try {
        const feelingsRef = window.dbRef(window.db, 'feelings');
        window.dbPush(feelingsRef, feelingData);
        input.value = '';
        alert('บันทึกแล้ว ❤️');
    } catch (error) {
        console.error('Error saving feelings:', error);
        alert('ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    }
}

function displayFeelings(feelings) {
    const container = document.getElementById('feelingsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!feelings) return;
    
    Object.entries(feelings)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .forEach(([id, feeling]) => {
            const feelingDiv = document.createElement('div');
            feelingDiv.className = 'feeling-item';
            
            const date = new Date(feeling.timestamp).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            feelingDiv.innerHTML = `
                <div class="feeling-header">
                    <span class="feeling-author">${feeling.authorName}</span>
                    <span class="feeling-date">${date}</span>
                </div>
                <div class="feeling-text">${feeling.text}</div>
            `;
            
            container.appendChild(feelingDiv);
        });
}

// Missing You System
function initMissing() {
    if (!window.db) {
        console.warn('Firebase not ready for missing, retrying...');
        setTimeout(initMissing, 1000);
        return;
    }
    
    try {
        const missingRef = window.dbRef(window.db, 'missing');
        window.dbOnValue(missingRef, (snapshot) => {
            const missing = snapshot.val();
            displayMissing(missing);
        });
        console.log('Missing system initialized');
    } catch (error) {
        console.error('Error initializing missing:', error);
    }
}

function sendMissing() {
    const input = document.getElementById('missingInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('กรุณาเขียนข้อความก่อน');
        return;
    }
    
    if (!window.db) {
        alert('กำลังเชื่อมต่อ Firebase... กรุณารอสักครู่');
        return;
    }
    
    const currentUser = localStorage.getItem('loggedInUser');
    const displayName = localStorage.getItem('displayName');
    
    const missingData = {
        text: text,
        from: currentUser,
        fromName: displayName,
        timestamp: Date.now()
    };
    
    try {
        const missingRef = window.dbRef(window.db, 'missing');
        window.dbPush(missingRef, missingData);
        input.value = '';
        alert('ส่งความคิดถึงแล้ว 💕');
    } catch (error) {
        console.error('Error sending missing:', error);
        alert('ไม่สามารถส่งได้ กรุณาลองใหม่');
    }
}

function displayMissing(missing) {
    const container = document.getElementById('missingList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!missing) return;
    
    Object.entries(missing)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .forEach(([id, msg]) => {
            const missingDiv = document.createElement('div');
            missingDiv.className = 'missing-item';
            
            const date = new Date(msg.timestamp).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            missingDiv.innerHTML = `
                <div class="missing-header">
                    <span class="missing-author">${msg.fromName} ส่งถึงคนรัก 💌</span>
                    <span class="missing-date">${date}</span>
                </div>
                <div class="missing-text">${msg.text}</div>
            `;
            
            container.appendChild(missingDiv);
        });
}

// Notes System
function initNotes() {
    if (!window.db) {
        console.warn('Firebase not ready for notes, retrying...');
        setTimeout(initNotes, 1000);
        return;
    }
    
    try {
        const notesRef = window.dbRef(window.db, 'notes');
        window.dbOnValue(notesRef, (snapshot) => {
            const notes = snapshot.val();
            displayNotes(notes);
        });
        console.log('Notes system initialized');
    } catch (error) {
        console.error('Error initializing notes:', error);
    }
}

function createNote() {
    const text = prompt('เขียนโน้ต:');
    if (!text || !text.trim()) return;
    
    if (!window.db) {
        alert('กำลังเชื่อมต่อ Firebase... กรุณารอสักครู่');
        return;
    }
    
    const currentUser = localStorage.getItem('loggedInUser');
    const displayName = localStorage.getItem('displayName');
    
    const noteData = {
        text: text.trim(),
        author: currentUser,
        authorName: displayName,
        timestamp: Date.now()
    };
    
    try {
        const notesRef = window.dbRef(window.db, 'notes');
        window.dbPush(notesRef, noteData);
    } catch (error) {
        console.error('Error creating note:', error);
        alert('ไม่สามารถสร้างโน้ตได้ กรุณาลองใหม่');
    }
}

function displayNotes(notes) {
    const container = document.getElementById('notesGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!notes) return;
    
    Object.entries(notes)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .forEach(([id, note]) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note-card';
            
            const date = new Date(note.timestamp).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            noteDiv.innerHTML = `
                <div class="note-header">
                    <span class="note-author">${note.authorName}</span>
                    <div class="note-actions">
                        <button class="note-action-btn" onclick="editNote('${id}', '${note.text.replace(/'/g, "\\'")}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action-btn" onclick="deleteNote('${id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${note.text}</div>
                <div class="note-date">${date}</div>
            `;
            
            container.appendChild(noteDiv);
        });
}

function editNote(id, currentText) {
    const newText = prompt('แก้ไขโน้ต:', currentText);
    if (newText === null || !newText.trim()) return;
    
    const noteRef = window.dbRef(window.db, `notes/${id}`);
    window.dbUpdate(noteRef, { text: newText.trim() });
}

function deleteNote(id) {
    if (!confirm('ต้องการลบโน้ตนี้หรือไม่?')) return;
    
    const noteRef = window.dbRef(window.db, `notes/${id}`);
    window.dbRemove(noteRef);
}

// Period Tracker & Calendar
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let periodData = null;
let selectedDate = null;
let dayNotes = {};

function initCalendar() {
    if (!window.db) {
        setTimeout(initCalendar, 1000);
        return;
    }
    
    // Load day notes
    try {
        const dayNotesRef = window.dbRef(window.db, 'dayNotes');
        window.dbOnValue(dayNotesRef, (snapshot) => {
            dayNotes = snapshot.val() || {};
            renderCalendar();
        });
    } catch (error) {
        console.error('Error loading day notes:', error);
    }
    
    renderCalendar();
}

function calculatePeriod() {
    const lastPeriodInput = document.getElementById('lastPeriodDate');
    const cycleLengthInput = document.getElementById('cycleLength');
    
    if (!lastPeriodInput.value) {
        alert('กรุณาเลือกวันแรกของเมน');
        return;
    }
    
    const lastPeriod = new Date(lastPeriodInput.value);
    const cycleLength = parseInt(cycleLengthInput.value) || 28;
    
    // Calculate ovulation (typically day 14 of cycle)
    const ovulationDay = new Date(lastPeriod);
    ovulationDay.setDate(lastPeriod.getDate() + 14);
    
    // Fertile window (5 days before to 1 day after ovulation)
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);
    
    // Next period
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength);
    
    // Period duration (typically 5-7 days)
    const periodEnd = new Date(lastPeriod);
    periodEnd.setDate(lastPeriod.getDate() + 6);
    
    periodData = {
        lastPeriod: lastPeriod,
        periodEnd: periodEnd,
        ovulationDay: ovulationDay,
        fertileStart: fertileStart,
        fertileEnd: fertileEnd,
        nextPeriod: nextPeriod,
        cycleLength: cycleLength
    };
    
    const resultDiv = document.getElementById('periodResult');
    resultDiv.innerHTML = `
        <h3>📊 ผลการคำนวณ</h3>
        <p><strong>🌸 วันตกไข่:</strong> ${formatThaiDate(ovulationDay)}</p>
        <p><strong>💕 ช่วงมีโอกาสตั้งครรภ์สูง:</strong><br>
           ${formatThaiDate(fertileStart)} - ${formatThaiDate(fertileEnd)}</p>
        <p><strong>📅 เมนครั้งถัดไป (โดยประมาณ):</strong> ${formatThaiDate(nextPeriod)}</p>
        <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
        <em>* ข้อมูลจะแสดงในปฏิทินด้านล่าง</em>
        </p>
    `;
    
    renderCalendar();
}

function renderCalendar() {
    const year = currentCalendarYear;
    const month = currentCalendarMonth;
    
    // Update month/year display
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    document.getElementById('currentMonthYear').textContent = 
        `${thaiMonths[month]} ${year + 543}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayDiv = createDayElement(day, month - 1, year, true);
        calendarDays.appendChild(dayDiv);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = createDayElement(day, month, year, false);
        calendarDays.appendChild(dayDiv);
    }
    
    // Next month days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = createDayElement(day, month + 1, year, true);
        calendarDays.appendChild(dayDiv);
    }
}

function createDayElement(day, month, year, isOtherMonth) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }
    
    if (date.getTime() === today.getTime()) {
        dayDiv.classList.add('today');
    }
    
    // Check if it's anniversary day (day 2)
    if (day === 2 && !isOtherMonth) {
        dayDiv.classList.add('anniversary-day');
    }
    
    // Check period data
    if (periodData) {
        const dateTime = date.getTime();
        
        // Period days
        if (dateTime >= periodData.lastPeriod.getTime() && 
            dateTime <= periodData.periodEnd.getTime()) {
            dayDiv.classList.add('period-day');
        }
        
        // Ovulation day
        if (dateTime === periodData.ovulationDay.getTime()) {
            dayDiv.classList.add('ovulation-day');
        }
        
        // Fertile window
        if (dateTime >= periodData.fertileStart.getTime() && 
            dateTime <= periodData.fertileEnd.getTime() &&
            dateTime !== periodData.ovulationDay.getTime()) {
            dayDiv.classList.add('fertile-day');
        }
        
        // Next period
        const nextPeriodEnd = new Date(periodData.nextPeriod);
        nextPeriodEnd.setDate(periodData.nextPeriod.getDate() + 6);
        if (dateTime >= periodData.nextPeriod.getTime() && 
            dateTime <= nextPeriodEnd.getTime()) {
            dayDiv.classList.add('period-day');
        }
    }
    
    // Check if has notes
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dayNotes[dateKey] && Object.keys(dayNotes[dateKey]).length > 0) {
        dayDiv.classList.add('has-note');
    }
    
    dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
    
    dayDiv.onclick = () => openDayNoteModal(year, month, day);
    
    return dayDiv;
}

function previousMonth() {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    renderCalendar();
}

function openDayNoteModal(year, month, day) {
    selectedDate = { year, month, day };
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    document.getElementById('modalDate').textContent = 
        `📅 ${day} ${thaiMonths[month]} ${year + 543}`;
    
    // Display existing notes for this day
    const notesList = document.getElementById('dayNotesList');
    notesList.innerHTML = '';
    
    if (dayNotes[dateKey]) {
        Object.entries(dayNotes[dateKey])
            .sort((a, b) => b[1].timestamp - a[1].timestamp)
            .forEach(([noteId, note]) => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'day-note-item';
                
                const time = new Date(note.timestamp).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                noteDiv.innerHTML = `
                    <div class="day-note-header">
                        <span class="day-note-author">${note.authorName}</span>
                        <span class="day-note-time">${time}</span>
                    </div>
                    <div class="day-note-text">${note.text}</div>
                    <button class="day-note-delete" onclick="deleteDayNote('${dateKey}', '${noteId}')">
                        ลบ
                    </button>
                `;
                
                notesList.appendChild(noteDiv);
            });
    }
    
    document.getElementById('newDayNote').value = '';
    document.getElementById('dayNoteModal').classList.add('show');
}

function closeDayNoteModal() {
    document.getElementById('dayNoteModal').classList.remove('show');
    selectedDate = null;
}

function saveDayNote() {
    if (!selectedDate) return;
    
    const noteText = document.getElementById('newDayNote').value.trim();
    if (!noteText) {
        alert('กรุณาเขียนโน้ตก่อน');
        return;
    }
    
    if (!window.db) {
        alert('กำลังเชื่อมต่อ Firebase... กรุณารอสักครู่');
        return;
    }
    
    const { year, month, day } = selectedDate;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const currentUser = localStorage.getItem('loggedInUser');
    const displayName = localStorage.getItem('displayName');
    
    const noteData = {
        text: noteText,
        author: currentUser,
        authorName: displayName,
        timestamp: Date.now()
    };
    
    try {
        const dayNoteRef = window.dbRef(window.db, `dayNotes/${dateKey}`);
        window.dbPush(dayNoteRef, noteData);
        
        document.getElementById('newDayNote').value = '';
        alert('บันทึกโน้ตแล้ว! 📝');
    } catch (error) {
        console.error('Error saving day note:', error);
        alert('ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    }
}

function deleteDayNote(dateKey, noteId) {
    if (!confirm('ต้องการลบโน้ตนี้หรือไม่?')) return;
    
    try {
        const noteRef = window.dbRef(window.db, `dayNotes/${dateKey}/${noteId}`);
        window.dbRemove(noteRef);
    } catch (error) {
        console.error('Error deleting day note:', error);
        alert('ไม่สามารถลบได้ กรุณาลองใหม่');
    }
}

function formatThaiDate(date) {
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    return `${day} ${month} ${year}`;
}

// Settings - Change Password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
    }
    
    const currentUser = localStorage.getItem('loggedInUser');
    const userPasswords = JSON.parse(localStorage.getItem('userPasswords') || '{}');
    const storedPassword = userPasswords[currentUser] || '1234';
    
    if (currentPassword !== storedPassword) {
        alert('รหัสผ่านปัจจุบันไม่ถูกต้อง');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        return;
    }
    
    userPasswords[currentUser] = newPassword;
    localStorage.setItem('userPasswords', JSON.stringify(userPasswords));
    
    alert('เปลี่ยนรหัสผ่านสำเร็จ! 🎉');
    
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}
