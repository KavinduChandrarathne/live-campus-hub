// Admin Calendar Management System
// Handles calendar views, event management, admin notifications, and event distribution

let currentDate = new Date();
let currentView = 'month';
let currentUser = null;
let allEvents = [];
let filteredEvents = [];
let currentFilter = 'all';
let editingEventId = null;
let isSubmitting = false;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentUser = getAdminUser();
    } catch (error) {
        console.error('Error getting admin user:', error);
        currentUser = null;
    }

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    initializeEventHandlers();
    loadEvents();
    renderCalendar();
    loadSidebarUser();
});

/**
 * Initialize all event handlers
 */
function initializeEventHandlers() {
    // View selector
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentView = e.currentTarget.dataset.view;
            renderCalendar();
        });
    });

    // Navigation
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderCalendar();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderCalendar();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    // Create event button
    document.getElementById('createEventBtn').addEventListener('click', () => {
        openEventModal();
    });

    // Event form submission
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);

    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeEventModal);
    document.getElementById('cancelBtn').addEventListener('click', closeEventModal);
    document.getElementById('closeDetailsBtn').addEventListener('click', closeDetailsModal);
    document.getElementById('closeDetailsModalBtn').addEventListener('click', closeDetailsModal);

    // Edit and delete buttons
    document.getElementById('editEventBtn').addEventListener('click', editCurrentEvent);
    document.getElementById('deleteEventBtn').addEventListener('click', deleteCurrentEvent);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.category;
            applyFilter();
        });
    });

    // Scroll to top
    document.getElementById('scrollTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        const scrollTopBtn = document.getElementById('scrollTop');
        scrollTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
    });
}

/**
 * Load events from database via PHP API
 */
async function loadEvents() {
    try {
        // For admin, fetch all events (no month/year filtering)
        const response = await fetch(`shared/php/get-calendar-events.php?user_id=${currentUser.id}&is_admin=true&category=${currentFilter}`);
        const result = await response.json();
        
        if (result.success) {
            allEvents = result.events.map(event => ({
                id: event.id,
                title: event.title,
                date: event.event_date,
                startTime: event.start_time,
                endTime: event.end_time || '23:59',
                category: event.category,
                clubId: event.club_id,
                clubName: event.club_name || '',
                description: event.description || '',
                isAdminEvent: event.created_by_type === 'admin',
                // Defensive defaults for UI
                targetGroup: event.targetGroup || 'all_users',
                reminder: event.reminder || null,
                sendNotification: event.sendNotification || false
            }));
        } else {
            allEvents = [];
        }
        filteredEvents = [...allEvents];
        applyFilter();
        populateEventsManagement();
    } catch (error) {
        console.error('Error loading events:', error);
        allEvents = [];
        filteredEvents = [];
    }
}

/**
 * Save events to local storage
 */
function saveEvents() {
    try {
        localStorage.setItem('adminCalendarEvents', JSON.stringify(allEvents));
    } catch (error) {
        console.error('Error saving events:', error);
    }
}

/**
 * Render calendar based on current view
 */
function renderCalendar() {
    const monthView = document.getElementById('monthView');
    const weekView = document.getElementById('weekView');
    const dayView = document.getElementById('dayView');

    // Hide all views
    monthView.style.display = 'none';
    weekView.style.display = 'none';
    dayView.style.display = 'none';

    // Show the selected view
    if (currentView === 'month') {
        monthView.style.display = 'block';
        renderMonthView();
    } else if (currentView === 'week') {
        weekView.style.display = 'block';
        renderWeekView();
    } else {
        dayView.style.display = 'block';
        renderDayView();
    }

    updateDateDisplay();
    populateSidebarEvents();
}

/**
 * Update the date display header
 */
function updateDateDisplay() {
    const monthYearElement = document.getElementById('currentMonth');
    if (currentView === 'month') {
        monthYearElement.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentView === 'week' || currentView === 'agenda') {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Full week includes Sunday
        monthYearElement.textContent = `Calendar: ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    } else {
        const dayName = DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
        monthYearElement.textContent = `${dayName}, ${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]}`;
    }
}

/**
 * Render month view calendar
 */
function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDayOfWeek = lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1;
    
    let html = '';
    
    // Previous month's days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        html += createDayElement(day, month - 1, year, true);
    }
    
    // Current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        html += createDayElement(day, month, year, false);
    }
    
    // Next month's days
    const totalCells = 42; // 6 rows × 7 days
    const filledCells = firstDayOfWeek + lastDay.getDate();
    const remainingCells = totalCells - filledCells;
    for (let day = 1; day <= remainingCells; day++) {
        html += createDayElement(day, month + 1, year, true);
    }
    
    document.getElementById('calendarGrid').innerHTML = html;
    
    // Add click handlers to day elements
    document.querySelectorAll('.calendar-day').forEach((dayElement, index) => {
        dayElement.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const dateStr = dayElement.dataset.date;
                const [y, mo, d] = dateStr.split('-').map(Number);
                currentDate = new Date(y, mo - 1, d); // Fix: month is zero-based
                currentView = 'day';
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.view-btn[data-view="day"]').classList.add('active');
                renderCalendar();
            }
        });
    });
}

/**
 * Create day element for month view
 */
function createDayElement(day, month, year, isOtherMonth) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const dayEvents = filteredEvents.filter(event => event.date === dateStr);
    const isToday = isDateToday(date);

    let className = 'calendar-day';
    if (isOtherMonth) className += ' other-month';
    if (isToday) className += ' today';
    if (dayEvents.length > 0) className += ' has-events';

    let eventsHtml = '';
    for (let i = 0; i < Math.min(dayEvents.length, 2); i++) {
        eventsHtml += `<div class="day-event-item ${dayEvents[i].category}">${dayEvents[i].title}</div>`;
    }
    if (dayEvents.length > 2) {
        eventsHtml += `<div class="more-events">+${dayEvents.length - 2} more</div>`;
    }

    return `
        <div class="${className}" data-date="${dateStr}">
            <div class="day-number">${day}</div>
            <div class="day-events">${eventsHtml}</div>
        </div>
    `;
}

/**
 * Render week view — iPhone Calendar style
 */
function renderWeekView() {
    const HOUR_HEIGHT = 60;
    const START_HOUR = 8;
    const END_HOUR = 19;
    const weekStart = getWeekStart(currentDate);

    let headerCols = '<th class="wv-gutter-head"></th>';
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const today = isDateToday(d);
        headerCols += `<th class="wv-col-head${today ? ' today' : ''}">
            <span class="wv-day-name">${DAYS[i].slice(0,3).toUpperCase()}</span>
            <span class="wv-day-num${today ? ' today-circle' : ''}">${d.getDate()}</span>
        </th>`;
    }

    let rows = '';
    for (let h = START_HOUR; h < END_HOUR; h++) {
        const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
        let cells = `<td class="wv-time-cell">${label}</td>`;
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const today = isDateToday(d);
            cells += `<td class="wv-day-cell${today ? ' today' : ''}" data-hour="${h}" data-date="${formatDate(d)}"></td>`;
        }
        rows += `<tr style="height:${HOUR_HEIGHT}px">${cells}</tr>`;
    }

    document.getElementById('weekGrid').innerHTML = `
        <div class="wv-wrap">
            <table class="wv-table">
                <thead><tr>${headerCols}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;

    const tbody = document.querySelector('#weekGrid .wv-table tbody');

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);

        filteredEvents.filter(ev => ev.date === dateStr).forEach(ev => {
            const [sh, sm] = ev.startTime.split(':').map(Number);
            const duration = calculateDuration(ev.startTime, ev.endTime);
            if (sh < START_HOUR || sh >= END_HOUR) return;

            const cell = tbody.querySelector(`td[data-date="${dateStr}"][data-hour="${sh}"]`);
            if (!cell) return;
            const cellRect = cell.getBoundingClientRect();
            const wrapRect = document.querySelector('#weekGrid .wv-wrap').getBoundingClientRect();
            const scrollTop = document.querySelector('#weekGrid .wv-wrap').scrollTop;

            const top = (cellRect.top - wrapRect.top) + scrollTop + (sm / 60) * HOUR_HEIGHT;
            const left = cellRect.left - wrapRect.left + 2;
            const width = cellRect.width - 4;
            const height = Math.max(22, (duration / 60) * HOUR_HEIGHT - 2);

            const pill = document.createElement('div');
            pill.className = `wv-event ${ev.category}`;
            pill.style.cssText = `top:${top}px;left:${left}px;width:${width}px;height:${height}px`;
            pill.innerHTML = `<strong>${ev.title}</strong><small>${ev.startTime}</small>`;
            pill.onclick = () => viewEventDetails(ev.id);
            document.querySelector('#weekGrid .wv-wrap').appendChild(pill);
        });
    }

    const now = new Date();
    if (now >= weekStart && now < new Date(weekStart.getTime() + 7 * 86400000)) {
        const dayIdx = (now.getDay() + 6) % 7;
        const d = new Date(weekStart);
        d.setDate(d.getDate() + dayIdx);
        const cell = tbody.querySelector(`td[data-date="${formatDate(d)}"][data-hour="${START_HOUR}"]`);
        if (cell) {
            const wrapRect = document.querySelector('#weekGrid .wv-wrap').getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();
            const scrollTop = document.querySelector('#weekGrid .wv-wrap').scrollTop;
            const top = (cellRect.top - wrapRect.top) + scrollTop +
                        ((now.getHours() - START_HOUR) * HOUR_HEIGHT) +
                        (now.getMinutes() / 60) * HOUR_HEIGHT;
            const left = cellRect.left - wrapRect.left;
            const width = cellRect.width;
            const line = document.createElement('div');
            line.className = 'wv-now-line';
            line.style.cssText = `top:${top}px;left:${left}px;width:${width}px`;
            document.querySelector('#weekGrid .wv-wrap').appendChild(line);
        }
    }
}

/**
 * Render day view — iPhone Calendar style
 */
function renderDayView() {
    const HOUR_HEIGHT = 60;
    const START_HOUR = 8;
    const END_HOUR = 19;
    const dateStr = formatDate(currentDate);
    const dayName = DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];

    document.querySelector('.day-header-text').innerHTML = `
        <p>${dayName}, ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p class="day-header-large">${currentDate.getDate()}</p>
    `;

    let rows = '';
    for (let h = START_HOUR; h < END_HOUR; h++) {
        const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
        rows += `<tr style="height:${HOUR_HEIGHT}px">
            <td class="dv-time-cell">${label}</td>
            <td class="dv-slot-cell" data-hour="${h}"></td>
        </tr>`;
    }

    document.getElementById('dayEventsGrid').innerHTML = `
        <div class="dv-wrap">
            <table class="dv-table"><tbody>${rows}</tbody></table>
        </div>`;
    document.getElementById('dayTimeSlots').innerHTML = '';

    const wrap = document.querySelector('#dayEventsGrid .dv-wrap');

    filteredEvents.filter(ev => ev.date === dateStr).forEach(ev => {
        const [sh, sm] = ev.startTime.split(':').map(Number);
        const duration = calculateDuration(ev.startTime, ev.endTime);
        if (sh < START_HOUR || sh >= END_HOUR) return;

        const cell = wrap.querySelector(`td.dv-slot-cell[data-hour="${sh}"]`);
        if (!cell) return;
        const wrapRect = wrap.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        const top = (cellRect.top - wrapRect.top) + wrap.scrollTop + (sm / 60) * HOUR_HEIGHT;
        const left = cellRect.left - wrapRect.left + 4;
        const width = cellRect.width - 8;
        const height = Math.max(44, (duration / 60) * HOUR_HEIGHT - 2);

        const pill = document.createElement('div');
        pill.className = `dv-event ${ev.category}`;
        pill.style.cssText = `top:${top}px;left:${left}px;width:${width}px;height:${height}px`;
        pill.innerHTML = `<div class="day-event-title">${ev.title}</div><small class="day-event-time">${ev.startTime} – ${ev.endTime}</small><small class="day-event-location">${ev.location || ''}</small>`;
        pill.onclick = () => viewEventDetails(ev.id);
        wrap.appendChild(pill);
    });

    if (isDateToday(currentDate)) {
        const now = new Date();
        const h = now.getHours();
        if (h >= START_HOUR && h < END_HOUR) {
            const cell = wrap.querySelector(`td.dv-slot-cell[data-hour="${h}"]`);
            if (cell) {
                const wrapRect = wrap.getBoundingClientRect();
                const cellRect = cell.getBoundingClientRect();
                const top = (cellRect.top - wrapRect.top) + wrap.scrollTop + (now.getMinutes() / 60) * HOUR_HEIGHT;
                const left = cellRect.left - wrapRect.left;
                const width = cellRect.width;
                const line = document.createElement('div');
                line.className = 'dv-now-line';
                line.style.cssText = `top:${top}px;left:${left}px;width:${width}px`;
                wrap.appendChild(line);
            }
        }
    }
}

/**
 * Generate array of hours for time slots
 */
function generateHours() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? '0' + i : i;
        hours.push(hour + ':00');
    }
    return hours;
}

/**
 * Calculate duration in minutes between two times
 */
function calculateDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    
    return endTotalMin - startTotalMin;
}

/**
 * Check if time row represents current hour
 */
function isCurrentHourRow(hourNum) {
    const now = new Date();
    const currentHour = now.getHours();
    return hourNum === currentHour && isDateToday(currentDate);
}

/**
 * Render day view
 */
/**
 * Apply category filter
 */
function applyFilter() {
    if (currentFilter === 'all') {
        filteredEvents = [...allEvents];
    } else {
        filteredEvents = allEvents.filter(event => event.category === currentFilter);
    }
    renderCalendar();
}

/**
 * Populate events sidebar based on current view
 */
function populateSidebarEvents() {
    let eventsToShow = [];
    const sidebarTitle = document.getElementById('sidebarTitle');
    
    if (currentView === 'month' || currentView === 'day') {
        // Show events for the current date
        const dateStr = formatDate(currentDate);
        eventsToShow = filteredEvents.filter(event => event.date === dateStr);
        sidebarTitle.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } else if (currentView === 'week') {
        // Show events for the full week (Mon-Sun)
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Full week
        
        eventsToShow = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= weekStart && eventDate <= weekEnd;
        });
        
        sidebarTitle.textContent = `Week: ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    
    eventsToShow.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
    });
    
    let html = '';
    if (eventsToShow.length === 0) {
        html = '<div class="no-events">No events found</div>';
    } else {
        eventsToShow.forEach(event => {
            const eventDate = new Date(event.date);
            html += `
                <div class="event-item ${event.category}" onclick="viewEventDetails(${event.id})">
                    <div class="event-item-title">${event.title}</div>
                    <div class="event-item-time">${event.startTime} - ${event.endTime}</div>
                    <div class="event-item-date">${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
            `;
        });
    }
    
    document.getElementById('eventsSidebarContent').innerHTML = html;
}

/**
 * Populate events management table
 */
function populateEventsManagement() {
    const recentEvents = allEvents
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 15);
    
    let html = '';
    
    if (recentEvents.length === 0) {
        html = '<p style="text-align: center; color: #999; padding: 20px;">No events created yet</p>';
    } else {
        html = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Target Group</th>
                        <th>Notification</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        recentEvents.forEach(event => {
            const eventDate = new Date(event.date);
            html += `
                <tr>
                    <td>${event.title}</td>
                    <td><span class="event-type-badge ${event.category}">${capitalize(event.category)}</span></td>
                    <td>${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                    <td>${event.startTime}</td>
                    <td>${event.clubId ? 'Club: ' + event.clubName : 'All Users'}</td>
                    <td>
                        <i class="fa-solid fa-check" style="color: ${event.isAdminEvent ? '#28a745' : '#ccc'};"></i>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="viewEventDetails(${event.id})">View</button>
                            <button class="action-btn delete" onclick="deleteEventById(${event.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    document.getElementById('eventsManagementList').innerHTML = html;
}

/**
 * Open event modal for creating new event
 */
function openEventModal(date = null) {
    editingEventId = null;
    document.getElementById('modalTitle').textContent = 'Create New Event';
    document.getElementById('eventForm').reset();
    
    // Reset target group and club select visibility
    document.getElementById('eventTargetGroup').value = '';
    document.getElementById('clubSelectGroup').style.display = 'none';
    
    if (date) {
        document.getElementById('eventDate').value = formatDate(date);
    } else {
        document.getElementById('eventDate').value = formatDate(currentDate);
    }
    
    // Load clubs into the dropdown
    loadClubsForEvent();
    
    document.getElementById('eventModal').classList.add('active');
}

/**
 * Toggle club select visibility based on target group
 */
function toggleClubSelect() {
    const targetGroup = document.getElementById('eventTargetGroup').value;
    const clubSelectGroup = document.getElementById('clubSelectGroup');
    
    if (targetGroup === 'club') {
        clubSelectGroup.style.display = 'block';
    } else {
        clubSelectGroup.style.display = 'none';
    }
}

/**
 * Load clubs into the event club dropdown
 */
async function loadClubsForEvent() {
    const clubSelect = document.getElementById('eventClub');
    if (!clubSelect) return;
    
    // Clear existing options except the first one
    clubSelect.innerHTML = '<option value="">Select a Club</option>';
    
    try {
        const response = await fetch('shared/php/api-get-clubs.php');
        const clubs = await response.json();
        
        if (Array.isArray(clubs) && clubs.length > 0) {
            clubs.forEach(club => {
                const option = document.createElement('option');
                option.value = club.id;
                option.textContent = club.name;
                clubSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading clubs:', error);
    }
}

/**
 * Close event modal
 */
function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    document.getElementById('eventForm').reset();
    editingEventId = null;
}

/**
 * Close event details modal
 */
function closeDetailsModal() {
    document.getElementById('eventDetailsModal').classList.remove('active');
}

/**
 * Handle event form submission
 */
async function handleEventSubmit(e) {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
        return;
    }
    isSubmitting = true;

    if (!currentUser || !currentUser.id) {
        showNotification('Admin session expired. Please log in again.', 'error');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        isSubmitting = false;
        return;
    }

    const targetGroup = document.getElementById('eventTargetGroup').value;
    let clubId = null;


    if (targetGroup === 'club') {
        clubId = document.getElementById('eventClub').value;
        if (!clubId) {
            showNotification('Please select a club for this event.', 'error');
            isSubmitting = false;
            return;
        }
    }

    const formData = {
        title: document.getElementById('eventTitle').value,
        event_date: document.getElementById('eventDate').value,
        category: document.getElementById('eventType').value,
        start_time: document.getElementById('eventStartTime').value,
        end_time: document.getElementById('eventEndTime').value || document.getElementById('eventStartTime').value,
        description: document.getElementById('eventDescription').value,
        club_id: clubId,
        user_id: currentUser.id,
        is_admin_event: '1'
    };

    // Debug log for troubleshooting
    console.log('Submitting event:', formData);

    if (!formData.title || !formData.event_date || !formData.start_time || !formData.user_id) {
        showNotification('Please fill in all required fields', 'error');
        isSubmitting = false;
        return;
    }

    try {
        const response = await fetch('shared/php/add-calendar-event.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        });

        const result = await response.json();

        if (result.success) {
            await loadEvents();
            renderCalendar();
            closeEventModal();
            showNotification('Event created successfully!');
        } else {
            showNotification(result.error || 'Failed to create event', 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showNotification('Failed to create event: ' + error.message, 'error');
    } finally {
        isSubmitting = false;
    }
}

/**
 * Send event notification to students
 */
async function sendEventNotification(event) {
    // This would typically call an API to send notifications
    console.log('Sending notification for event:', event);
    // Mock notification sending
    showNotification(`Notification sent to ${event.targetGroup} about "${event.title}"`);
}

/**
 * View event details in modal
 */
function viewEventDetails(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('detailsTitle').textContent = event.title;
    
    const eventDate = new Date(event.date);
    let html = `
        <div class="detail-item">
            <div class="detail-label">Title</div>
            <div class="detail-value">${event.title}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Event Type</div>
            <div class="detail-value"><span class="detail-value category">${capitalize(event.category)}</span></div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${event.startTime} - ${event.endTime}</div>
        </div>
    `;
    
    if (event.location) {
        html += `
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${event.location}</div>
            </div>
        `;
    }
    
    if (event.description) {
        html += `
            <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">${event.description}</div>
            </div>
        `;
    }
    
    html += `
        <div class="detail-item">
            <div class="detail-label">Target Group</div>
            <div class="detail-value">${capitalize(event.targetGroup.replace(/_/g, ' '))}</div>
        </div>
    `;
    
    if (event.reminder) {
        html += `
            <div class="detail-item">
                <div class="detail-label">Reminder</div>
                <div class="detail-value">${getReminderText(event.reminder)}</div>
            </div>
        `;
    }
    
    html += `
        <div class="detail-item">
            <div class="detail-label">Notification Status</div>
            <div class="detail-value">${event.sendNotification ? '✓ Will be sent to students' : '✗ Not sending notification'}</div>
        </div>
    `;
    
    document.getElementById('eventDetailsContent').innerHTML = html;
    editingEventId = eventId;
    document.getElementById('eventDetailsModal').classList.add('active');
}

/**
 * Edit current event
 */
function editCurrentEvent() {
    if (!editingEventId) return;
    
    const event = allEvents.find(e => e.id === editingEventId);
    if (!event) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.category;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventStartTime').value = event.startTime;
    document.getElementById('eventEndTime').value = event.endTime;
    document.getElementById('eventDescription').value = event.description || '';
    
    closeDetailsModal();
    document.getElementById('eventModal').classList.add('active');
}

/**
 * Delete current event
 */
function deleteCurrentEvent() {
    if (!editingEventId) return;
    deleteEventById(editingEventId);
}

/**
 * Delete event by ID
 */
async function deleteEventById(eventId) {
    const event = allEvents.find(ev => ev.id === eventId);

    if (event.created_by_type === 'admin' && currentUser.role !== 'admin') {
        showNotification('You do not have permission to delete this admin event.', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
        try {
            const response = await fetch(`shared/php/delete-calendar-event.php?id=${eventId}&user_id=${currentUser.id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                await loadEvents();
                renderCalendar();
                closeDetailsModal();
                showNotification('Event deleted successfully!');
            } else {
                showNotification(result.error || 'Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showNotification('Failed to delete event', 'error');
        }
    }
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(d.setDate(diff));
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Check if date is today
 */
function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

/**
 * Get reminder text from minutes
 */
function getReminderText(minutes) {
    if (minutes < 60) return minutes + ' minutes';
    if (minutes === 66) return '1 hour';
    if (minutes === 1440) return '1 day';
    return minutes + ' minutes';
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Show notification toast
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 16px 24px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideInUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Load sidebar user information
 */
async function loadSidebarUser() {
    try {
        const user = getAdminUser();
        if (!user) {
            window.location.href = '../index.html';
            return;
        }

        document.getElementById('sidebar-name').textContent = user.name || 'Admin';
        document.getElementById('sidebar-email').textContent = user.email || '';

        // Load user picture if available
        if (user.profilePicture) {
            document.getElementById('sidebar-picture').src = user.profilePicture;
        } else {
            document.getElementById('sidebar-picture').src = '../images/default-avatar.png';
        }

        // Highlight active nav item
        document.querySelectorAll('nav a').forEach(link => {
            if (link.getAttribute('href') === 'Admin/calendar.html' || link.getAttribute('href') === 'calendar.html') {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error loading sidebar user:', error);
    }
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
