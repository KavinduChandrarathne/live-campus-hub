# Calendar Database Upgrade

## Overview
Migrated calendar events from localStorage to MySQL database. Events are now stored in the `calendar_events` table with support for club-specific visibility, admin-created events, and proper CRUD operations via PHP endpoints.

## How It Works

### Data Flow
1. **User creates event** → JavaScript sends POST to `add-calendar-event.php`
2. **PHP validates** → Checks required fields (title, date, time, creator)
3. **PHP inserts** → Saves to `calendar_events` table with category icon auto-assigned
4. **User views events** → JavaScript calls `get-calendar-events.php`
5. **PHP filters** → Returns only events the user should see:
   - Their own created events
   - Admin events with no club (visible to all)
   - Admin events for clubs they belong to

### Club Visibility Logic
- **User events**: Only visible to the creator
- **Admin events (no club)**: Visible to all users
- **Admin events (with club)**: Only visible to club members — enforced on PHP side, not just JS

## Files Created or Modified

### Database
- [Admin/shared/campus_hub.sql](Admin/shared/campus_hub.sql) — Added `calendar_events` table (line 203)

### PHP Endpoints (New)
- [Admin/shared/php/add-calendar-event.php](Admin/shared/php/add-calendar-event.php) — Create event
- [Admin/shared/php/get-calendar-events.php](Admin/shared/php/get-calendar-events.php) — Fetch events with filtering
- [Admin/shared/php/update-calendar-event.php](Admin/shared/php/update-calendar-event.php) — Update event
- [Admin/shared/php/delete-calendar-event.php](Admin/shared/php/delete-calendar-event.php) — Delete event

### JavaScript (Modified)
- [javascript/calendar.js](javascript/calendar.js) — User calendar:
  - `loadEvents()` — Now fetches from database instead of localStorage
  - `handleEventSubmit()` — Now calls PHP endpoint
  - `deleteCurrentEvent()` — Now calls PHP endpoint

- [Admin/javascript/calendar.js](Admin/javascript/calendar.js) — Admin calendar:
  - `loadEvents()` — Now fetches from database
  - `handleEventSubmit()` — Now calls PHP endpoint
  - `deleteEventById()` — Now calls PHP endpoint

## Data Structure

```sql
calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    category ENUM('personal', 'meeting', 'event', 'other', 'lecture', 'exam', 'workshop', 'notice') NOT NULL,
    icon VARCHAR(100),
    created_by_type ENUM('user', 'admin') NOT NULL,
    created_by_id INT NOT NULL,
    club_id INT NULL,
    reminder_minutes INT DEFAULT 30,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Category to Icon Mapping
| Category | Icon |
|----------|------|
| personal | fa-user |
| meeting | fa-users |
| event | fa-star |
| other | fa-calendar |
| lecture | fa-chalkboard-user |
| exam | fa-pencil |
| workshop | fa-person-chalkboard |
| notice | fa-bell |

## API Usage

### Add Event
```
POST Admin/shared/php/add-calendar-event.php
Body: title, description, event_date, start_time, end_time, location, category, club_id, reminder_minutes, created_by_type, created_by_id
```

### Get Events
```
GET Admin/shared/php/get-calendar-events.php?user_id=1&is_admin=false&date_from=2026-01-01&date_to=2026-12-31&category=personal
```

### Update Event
```
POST Admin/shared/php/update-calendar-event.php
Body: event_id, user_id, is_admin, title, description, event_date, start_time, end_time, location, category, club_id, reminder_minutes
```

### Delete Event
```
DELETE Admin/shared/php/delete-calendar-event.php?event_id=1&user_id=1&is_admin=false
```

## Customization

### Change Category Icons
Edit the `$iconMap` array in:
- `add-calendar-event.php`
- `update-calendar-event.php`

### Add New Categories
1. Add to MySQL ENUM: `ALTER TABLE calendar_events MODIFY category ENUM(...,'new_category')`
2. Add icon mapping in PHP files
3. Add option to HTML select in calendar.html

## Version
- Version: 1.2.1
- Date: 28 April 2026
- Status: Complete

## Changelog

### v1.2.1 (28 April 2026)
- Fixed: Week and Day views now display correctly (added view toggle in renderCalendar)
- Fixed: Sidebar now updates after event creation (added populateSidebarEvents call in handleEventSubmit)

### v1.2.0 (28 April 2026)
- Updated `get-calendar-events.php` to include club name via LEFT JOIN
- Added `clubName` field to event objects in both user and admin JS
- Updated sidebar event display to show category icon and club name
- Added CSS styles for `.event-item-header` and `.event-item-club`

### v1.1.0 (28 April 2026)
- Added club selection dropdown to admin event creation modal
- Created `get-clubs.php` endpoint for fetching club list
- Updated admin calendar.html with club selector UI
- Updated admin calendar.js with `loadClubsForModal()` and `toggleClubSelect()` functions