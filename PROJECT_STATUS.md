# Live Campus Hub — Project Status

> Last Updated: 29 April 2026
> Current Phase: Calendar Display Enhancements Complete

---

## Project Overview

**Live Campus Hub** is a multi-purpose campus web platform built with:
- **Frontend**: HTML, CSS, Vanilla JavaScript (no frameworks)
- **Backend**: PHP (XAMPP / Apache, localhost)
- **Storage**: MySQL database (campus_hub)
- **Icons**: Font Awesome 6.5.0
- **Root Path**: `C:\xampp\htdocs\live-campus-hub\`

---

## What Has Been Done ✓

### Calendar Display Enhancements (29 April 2026)

#### 1. Day View Time Grid Fix (User & Admin)
- **Problem**: Events only showed in the right sidebar, not in the main day view time grid
- **Solution**: Removed `display: none` from `.day-content` and `.time-column` in both:
  - `styles/calendar.css` (user calendar)
  - `Admin/styles/calendar.css` (admin calendar)
- **Result**: Day view now displays events in their correct time slots in the middle panel

#### 2. Create Event Date Fix (User & Admin)
- **Problem**: "Add Personal Event" button in day view always used today's date instead of the selected date
- **Solution**: Changed `openEventModal(new Date())` to `openEventModal(currentDate)` in:
  - `calendar.html` line 160 (user calendar)
  - `Admin/calendar.html` line 153 (admin calendar)
- **Result**: When creating an event from a specific day (e.g., May 1), the modal now defaults to that date

#### 3. CSS Syntax Error Fix
- **Problem**: Orphaned CSS properties (`gap: 8px;` and `z-index: 20;`) outside any rule block in `styles/calendar.css`
- **Solution**: Removed the orphaned lines
- **Files Fixed**: `styles/calendar.css` (line 614)

---

### Calendar Database Upgrade (Phase 1 - 28 April 2026)

#### 1. Database Table Created
- **File**: `Admin/shared/campus_hub.sql` (line 203)
- **Table**: `calendar_events`
- **Fields**: id, title, description, event_date, start_time, end_time, location, category, icon, created_by_type, created_by_id, club_id, reminder_minutes, created_at, updated_at

#### 2. PHP Endpoints Created
| Endpoint | File | Purpose |
|----------|------|---------|
| Create Event | `Admin/shared/php/add-calendar-event.php` | Insert new event to database |
| Get Events | `Admin/shared/php/get-calendar-events.php` | Fetch events with club visibility filtering |
| Update Event | `Admin/shared/php/update-calendar-event.php` | Edit existing event |
| Delete Event | `Admin/shared/php/delete-calendar-event.php` | Remove event |

#### 3. JavaScript Updated
| File | Functions Updated |
|------|-------------------|
| `javascript/calendar.js` | `loadEvents()`, `handleEventSubmit()`, `deleteCurrentEvent()` |
| `Admin/javascript/calendar.js` | `loadEvents()`, `handleEventSubmit()`, `deleteEventById()` |

#### 4. Documentation Created
- `CALENDAR_DATABASE_UPGRADE.md` — Detailed technical documentation

---

## What Needs to Be Done 📋

### Calendar Display Enhancements (29 April 2026) — COMPLETE ✓
- [x] Fix day view not showing events in time grid (removed `display: none` from `.day-content` and `.time-column`)
- [x] Fix "Create Event" button using wrong default date (changed `new Date()` to `currentDate`)
- [x] Fix CSS syntax error in `styles/calendar.css` (removed orphaned properties)

### Remaining Calendar Features

#### Priority 1: Club Selection for Admin Events
- [x] Add club selection dropdown to admin event creation modal
- [x] Update admin calendar.html to include club selector
- [x] Modify `add-calendar-event.php` to accept club_id from admin
- [x] Create `get-clubs.php` endpoint for fetching clubs

#### Priority 2: Event Display Enhancements
- [x] Ensure category icons display correctly in all views (Month/Week/Day)
- [x] Verify right-side panel shows all events for selected date
- [x] Add club name display for club-specific events

#### Priority 3: View Switching
- [x] Already implemented: Month, Week, Day views
- [x] Verify no page reload on view switch (JS-only)
- [x] Test view persistence across navigation
- [x] Fixed: Week and Day views now display correctly (added view toggle in renderCalendar)
- [x] Fixed: Sidebar now updates after event creation (added populateSidebarEvents call)

### Future Features (Not Started)

#### Emergency Alert System
- Status: Complete (from previous work)
- Files: `emergency-alerts.html`, `javascript/emergency-alert-banner.js`

#### Transit System
- Status: Complete (from previous work)
- Files: `transit.html`, `bus-route.html`

#### Campus Clubs
- Status: Complete (from previous work)
- Files: `clubs.html`, `club-detail.html`

---

## Technical Context for Next AI Agent

### Current Architecture

```
live-campus-hub/
├── Admin/
│   ├── shared/
│   │   ├── php/           ← PHP API endpoints (MySQL)
│   │   └── json/          ← Legacy JSON storage (not used for calendar)
│   ├── javascript/        ← Admin-side JS
│   └── styles/           ← Admin-side CSS
├── javascript/           ← User-side JS
├── styles/              ← User-side CSS
├── *.html               ← 14+ HTML pages
└── *.md                 ← Documentation
```

### Database Connection
- File: `Admin/shared/php/db.php`
- Database: `campus_hub`
- User: `root` (no password)

### Key Patterns Used

1. **PHP Endpoints**: Return JSON `{ success: true/false, data: ... }`
2. **JavaScript**: Use `fetch()` for API calls, `await` for async operations
3. **Club Visibility**: Enforced on PHP side, not just JS (see `get-calendar-events.php`)
4. **User Auth**: Stored in `sessionStorage.currentUser`

### Important Files to Know

| File | Purpose |
|------|---------|
| `Admin/shared/php/db.php` | PDO database connection |
| `javascript/common.js` | `getCurrentUser()`, `showToast()` |
| `Admin/javascript/auth.js` | Admin authentication |

### Category Icons Mapping

```php
$iconMap = [
    'personal' => 'fa-user',
    'meeting' => 'fa-users',
    'event' => 'fa-star',
    'other' => 'fa-calendar',
    'lecture' => 'fa-chalkboard-user',
    'exam' => 'fa-pencil',
    'workshop' => 'fa-person-chalkboard',
    'notice' => 'fa-bell'
];
```

---

## Coding Conventions (Non-Negotiable)

1. **No frameworks** — Pure HTML/CSS/JS only
2. **No npm/build tools**
3. **JSON storage via PHP** — Never access JSON directly from JS
4. **PHP endpoints in** `Admin/shared/php/`
5. **New feature JS/CSS** in separate files
6. **Admin pages** in `/Admin/`, user pages in root
7. **Alert banner** on every new page:
```html
<div id="emergencyAlertBanner"></div>
```
8. **File names**: kebab-case only
9. **Responsive**: mobile at 480px, tablet at 768px
10. **No new CDN dependencies**

### Code Style Rule

- **Comments**: Only add if explaining WHY, never WHAT
- **Names**: Must be self-explanatory — if it needs a comment, rename it
- **No verbose console.log chains**
- **No over-engineered null-checks**
- **Keep functions short and single-purpose**

---

## How to Continue

### If Continuing Calendar Upgrade

1. Read `CALENDAR_DATABASE_UPGRADE.md` for technical details
2. Check `calendar.html` and `Admin/calendar.html` for current UI
3. Test the PHP endpoints:
   - `Admin/shared/php/add-calendar-event.php`
   - `Admin/shared/php/get-calendar-events.php`
4. Add club selection to admin modal (see Priority 1 above)

### If Starting New Feature

1. Create new feature MD file in project root
2. Add database table to `Admin/shared/campus_hub.sql`
3. Create PHP endpoints in `Admin/shared/php/`
4. Update JavaScript to use endpoints
5. Update this file with progress

---

## Project File Structure

```
live-campus-hub/
├── index.html                 # Login page
├── signup.html               # Registration
├── dashboard.html            # User dashboard
├── calendar.html             # User calendar (updated)
├── clubs.html                # Campus clubs
├── club-detail.html          # Club details
├── facility.html             # Facilities
├── facility-event-updates.html
├── transit.html              # Transit routes
├── bus-route.html
├── location-updates.html
├── updates.html              # Updates feed
├── profile.html              # User profile
├── rewards.html              # Rewards system
├── emergency-alerts.html     # Emergency alerts
├── alert-details.html
├── Admin/
│   ├── dashboard.html
│   ├── calendar.html         # Admin calendar (updated)
│   ├── campus-clubs.html
│   ├── club-join-requests.html
│   ├── emergency-alerts.html
│   ├── facility-event-admin.html
│   ├── transit.html
│   ├── transit-requests.html
│   ├── updates-feed.html
│   ├── add-club.html
│   ├── add-notification.html
│   ├── user-search.html
│   ├── user-edit.html
│   ├── admin-profile.html
│   ├── shared/
│   │   ├── php/              # All API endpoints
│   │   │   ├── db.php
│   │   │   ├── add-calendar-event.php    # NEW
│   │   │   ├── get-calendar-events.php   # NEW
│   │   │   ├── update-calendar-event.php # NEW
│   │   │   ├── delete-calendar-event.php # NEW
│   │   │   └── ... (other endpoints)
│   │   └── campus_hub.sql    # Database schema
│   ├── javascript/
│   │   ├── calendar.js       # Updated
│   │   └── ... (other JS)
│   └── styles/
├── javascript/
│   ├── calendar.js           # Updated
│   ├── common.js
│   └── ... (other JS)
├── styles/
│   ├── calendar.css
│   ├── dashboard.css
│   └── ... (other CSS)
├── CALENDAR_DATABASE_UPGRADE.md
├── CALENDAR_SYSTEM_DOCUMENTATION.md
├── EMERGENCY_ALERTS_ONE_PAGE.md
└── ... (other MD files)
```

---

## Contact / Context

This project was built by a team with AI assistance. When continuing:
1. Read this file first
2. Check existing MD files for feature context
3. Do not redesign existing UI — extend only
4. Always ask clarifying questions before writing code
5. Update documentation after each feature

---

*End of Project Status*