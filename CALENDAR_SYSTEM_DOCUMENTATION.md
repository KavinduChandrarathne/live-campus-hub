## Advanced Calendar System Documentation

### Overview
The Advanced Calendar System enables both students and admins to create, manage, and track academic, personal, and club events within the Campus Hub platform.

---

## System Architecture

### User Roles & Permissions

#### Student Panel (calendar.html)
- **Create/Edit/Delete** personal events only
- **View** Admin-posted events
- **View** Club events (when member)
- **Manage** reminder notifications
- **Filter** events by category

#### Admin Panel (Admin/calendar.html)
- **Create/Edit/Delete** all events
- **Send** notifications to students
- **Target** specific groups (all students, departments, years, clubs)
- **Set** event types (Lectures, Exams, Workshops, Holiday/Closure Notices)
- **Manage** events management dashboard

---

## Database Schema

### Table: calendar_events
```sql
CREATE TABLE calendar_events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('lecture', 'exam', 'workshop', 'notice', 'personal', 'meeting', 'event', 'other') NOT NULL,
    created_by INT NOT NULL,
    target_group VARCHAR(50),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(255),
    category VARCHAR(50),
    recurrence VARCHAR(50),
    reminder_minutes INT,
    external_sync BOOLEAN DEFAULT FALSE,
    send_notification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Table: calendar_event_users
```sql
CREATE TABLE calendar_event_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    event_status ENUM('pending', 'accepted', 'dismissed', 'attended') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES calendar_events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_event_user (event_id, user_id)
);
```

### Table: calendar_notifications
```sql
CREATE TABLE calendar_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    message TEXT,
    notification_type VARCHAR(50),
    sent_time DATETIME,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES calendar_events(event_id)
);
```

---

## File Structure

### Student Calendar Files
- **calendar.html** - Main student calendar page with multiple views and event management UI
- **styles/calendar.css** - Comprehensive styling with responsive design
- **javascript/calendar.js** - Calendar functionality and event management

### Admin Calendar Files
- **Admin/calendar.html** - Admin calendar page with advanced management features
- **Admin/styles/calendar.css** - Admin-specific styling
- **Admin/javascript/calendar.js** - Admin functionality including notifications

---

## Features & Functionality

### 1. Multiple Calendar Views

#### Month View
- Grid-based calendar display showing all days of the month
- Color-coded events by category
- Quick event preview with "more" indicator
- Click any date to see day details

#### Week View
- 7-column layout with day headers
- Individual event cards per day
- Time slots visible for each event
- Better for seeing event details

#### Day View
- Detailed view of selected day
- All events listed with full details
- Perfect for daily planning
- Quick add event button

### 2. Event Management

#### Student Event Creation
```
Form Fields:
- Title (required)
- Date (required)
- Category: Personal, Meeting, Event, Other
- Start Time (required)
- End Time (required)
- Location (optional)
- Description (optional)
- Reminder: 10 min, 30 min, 1 hour, 1 day
```

#### Admin Event Creation
```
Form Fields:
- Title (required)
- Event Type: Lectures, Exams, Workshops, Holiday/Closure Notices
- Date (required)
- Start/End Time (required)
- Location (optional)
- Description (optional)
- Target Group: All Students, Specific Department, Specific Year, Club Members, Custom
- Reminder: 10 min, 30 min, 1 hour, 1 day
- Send as Notification (checkbox)
```

### 3. Event Categories & Colors

**Student Categories:**
- Personal: Purple (#9c27b0)
- Meeting: Green (#4caf50)
- Event: Pink (#e91e63)
- Admin Events: Orange (#ff9800)
- Club Events: Teal (#009688)

**Admin Event Types:**
- Lectures: Blue (#0c5460)
- Exams: Red (#721c24)
- Workshops: Green (#155724)
- Notices: Navy (#084298)

### 4. Filtering System

**Student Filters:**
- All Events
- Personal only
- Meetings only
- Events only
- Admin Events only
- Club Events only

**Admin Filters:**
- All Events
- Lectures
- Exams
- Workshops
- Notices

### 5. Upcoming Events Sidebar

**Students:**
- Shows next 10 upcoming events
- Displays days until event
- "Today" and "Tomorrow" badges
- Quick view on click

**Admins:**
- Recent events management table
- Event type badges
- Target group display
- Notification status
- Quick edit/delete actions

### 6. Reminder Notifications

**Reminder Timing Options:**
- 10 minutes before
- 30 minutes before
- 1 hour before
- 1 day before

**Implementation:**
- Stored in event object
- Client-side storage in localStorage
- Can be extended to server-side for persistent notifications

### 7. Admin Notification System

**Features:**
- Send notifications to students when creating events
- Choose target groups for notifications
- Notification type system ready
- Calendar_notifications table for tracking

---

## Local Storage Implementation

### Student Events Storage
```javascript
localStorage.setItem('calendarEvents_' + userId, JSON.stringify(events));
```

### Admin Events Storage
```javascript
localStorage.setItem('adminCalendarEvents', JSON.stringify(events));
```

**Event Object Structure:**
```javascript
{
    id: timestamp,
    title: string,
    date: "YYYY-MM-DD",
    category: string,
    startTime: "HH:mm",
    endTime: "HH:mm",
    location: string,
    description: string,
    reminder: minutes,
    createdBy: userId,
    targetGroup: string,
    sendNotification: boolean,
    createdAt: ISO string
}
```

---

## API Endpoints (Ready for Implementation)

### Student Events

**GET /api/calendar/events**
- Get user's personal events
- Get admin-posted events

**POST /api/calendar/events**
- Create new personal event
```json
{
    "title": "Study Session",
    "date": "2026-06-15",
    "category": "personal",
    "startTime": "14:00",
    "endTime": "16:00",
    "location": "Library",
    "description": "Math preparation",
    "reminder": 30
}
```

**PUT /api/calendar/events/{eventId}**
- Update personal event

**DELETE /api/calendar/events/{eventId}**
- Delete personal event

### Admin Events

**GET /api/admin/calendar/events**
- Get all events in system

**POST /api/admin/calendar/events**
- Create new admin event
```json
{
    "title": "Mid-term Exams",
    "eventType": "exam",
    "date": "2026-06-20",
    "startTime": "09:00",
    "endTime": "12:00",
    "location": "Main Hall",
    "description": "Mathematics Examination",
    "targetGroup": "all_students",
    "reminder": 1440,
    "sendNotification": true
}
```

**PUT /api/admin/calendar/events/{eventId}**
- Update admin event

**DELETE /api/admin/calendar/events/{eventId}**
- Delete admin event

### Event User Associations

**POST /api/calendar/event-users/{eventId}/response**
- Student acceptance/dismissal of event
```json
{
    "eventStatus": "accepted" // or "dismissed"
}
```

### Notifications

**GET /api/calendar/notifications**
- Get user notifications
- Query parameters: ?unread=true

**PUT /api/calendar/notifications/{notificationId}/read**
- Mark notification as read

---

## JavaScript Functions Reference

### Calendar.js (Student)

**Core Functions:**
- `loadEvents()` - Load events from storage
- `saveEvents()` - Save events to storage
- `renderCalendar()` - Render appropriate view
- `renderMonthView()` - Month view rendering
- `renderWeekView()` - Week view rendering
- `renderDayView()` - Day view rendering
- `applyFilter()` - Apply category filters
- `populateUpcomingEvents()` - Update upcoming list

**Event Management:**
- `openEventModal(date)` - Open event creation form
- `closeEventModal()` - Close event form
- `handleEventSubmit(e)` - Submit event form
- `viewEventDetails(eventId)` - Show event details
- `editCurrentEvent()` - Edit event
- `deleteCurrentEvent()` - Delete event

**Utility Functions:**
- `formatDate(date)` - Format date as YYYY-MM-DD
- `isDateToday(date)` - Check if date is today
- `getWeekStart(date)` - Get Monday of week
- `capitalize(str)` - Capitalize string
- `getReminderText(minutes)` - Convert minutes to readable text
- `showNotification(message)` - Show toast notification

### Admin/javascript/calendar.js

**Additional Admin Functions:**
- `populateEventsManagement()` - Populate events table
- `sendEventNotification(event)` - Send notification to students
- `deleteEventById(eventId)` - Delete event with confirmation

---

## Responsive Design

### Breakpoints

**Desktop (>768px):**
- Full calendar grid (7 columns)
- Multi-column layouts
- Sidebar visible

**Tablet (481px - 768px):**
- Adjusted spacing
- Single column week view
- Form fields stacked

**Mobile (<480px):**
- Smaller font sizes
- Touch-friendly buttons
- Single column layouts
- Vertical stacking

---

## Color Scheme

**Primary Colors:**
- Navy: #1f3556
- Blue: #007bff (Student primary)
- Red: #dc3545 (Admin primary)
- Light Gray: #f0f4f8

**Category Colors:**
- Personal: Purple
- Meeting: Green
- Event: Pink
- Admin: Orange
- Club: Teal
- Lecture: Cyan
- Exam: Dark Red
- Workshop: Dark Green
- Notice: Navy

---

## Security Considerations

### Client-Side (Current)
- User authentication check on page load
- Role-based access (admin vs student)
- Event ownership validation

### Server-Side (Recommended)
- User authentication validation
- Authorization checks (user can only edit own events)
- Input validation and sanitization
- SQL injection prevention
- CSRF token validation

---

## Future Enhancements

1. **Recurring Events**
   - Daily, Weekly, Monthly, Yearly options
   - Exception handling for recurring events

2. **Event Sharing**
   - Share events with specific users
   - Collaborative event management

3. **Calendar Sync**
   - Google Calendar integration
   - iCalendar export/import
   - Outlook sync

4. **Advanced Notifications**
   - Email notifications
   - SMS notifications
   - Push notifications

5. **Analytics**
   - Event attendance tracking
   - Popular event times
   - User engagement metrics

6. **Calendar Customization**
   - Custom colors per category
   - Theme selection
   - Custom view configurations

7. **Search & Advanced Filtering**
   - Full-text search
   - Location-based search
   - Advanced date range filters

8. **Mobile App**
   - Native mobile calendar
   - Offline support
   - Push notifications

---

## Setup Instructions

### 1. Database Setup
Run the provided SQL scripts to create tables:
```sql
-- Run in your database
-- Cal.pending schema from calendar_events, calendar_event_users, calendar_notifications tables above
```

### 2. File Placement
- Student files in root directory
- Admin files in /Admin directory
- CSS in /styles and /Admin/styles
- JavaScript in /javascript and /Admin/javascript

### 3. API Integration (When Ready)
Replace localStorage calls with API calls:
```javascript
// Example conversion
// From: localStorage.getItem('calendarEvents_' + userId)
// To: fetch('/api/calendar/events').then(r => r.json())
```

### 4. Testing
1. Open calendar.html (student) or Admin/calendar.html (admin)
2. Test creating, editing, deleting events
3. Test switching views (month, week, day)
4. Test filtering by category
5. Test responsive design on mobile

---

## Troubleshooting

### Events Not Appearing
- Check browser console for errors
- Verify localStorage is enabled
- Check date format (YYYY-MM-DD)
- Clear cache and reload

### Modal Not Closing
- Check modal.active class styling
- Verify close button click handlers
- Check for JavaScript errors

### Calendar Not Rendering
- Verify currentDate is valid Date object
- Check calendarGrid element exists
- Verify month/week/day view divs exist

### Styling Issues
- Check CSS file is linked correctly
- Verify responsive breakpoints
- Check browser compatibility
- Clear CSS cache

---

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Support & Maintenance

For issues or feature requests, please contact the development team.

**Last Updated:** April 2026
**Version:** 1.0.0
