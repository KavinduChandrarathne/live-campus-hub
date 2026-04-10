# Emergency Safety Alert System - Visual Guide

## Admin Panel Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ CAMPUS HUB [Logo]                                                   │
├─────────────┬─────────────────────────────────────────────────────┤
│  Dashboard  │  Emergency                                           │
│  Clubs      ├────────────────────┬────────────────────────────────┤
│  Facility   │  ALERT DETAILS     │  ACTIVE ALERT MANAGEMENT       │
│  Transit    │  ┌────────────────┐│  ┌──────────────────────┐     │
│  Emergency  │  │ Title: [______]││  │ 🔥 Fire & Evacuation │     │
│  🔴 Active  │  │                 ││  │ Type: 🔥 Fire        │     │
│  Updates    │  │ Type: [Icons]   ││  │ Location: 3rd Floor  │     │
│  Rewards    │  │ 🔥🚪⚠️🛡️💧...  ││  │ Severity: ██ HIGH    │     │
│             │  │                 ││  │ Active until: 14:00  │     │
│             │  │ Location: [___] ││  │                      │     │
│             │  │ Description:    ││  │ [Edit] [Resolve] [X] │     │
│             │  │ [___________]   ││  │                      │     │
│             │  │                 ││  │ ┌──────────────────┐ │     │
│             │  │ Severity:       ││  │ │ 🔥 Fire Alert   │ │     │
│             │  │ [HIGH][Med][Low]││  │ │ Type: Fire      │ │     │
│             │  │                 ││  │ │ Location: Lobby │ │     │
│             │  │ Instructions:   ││  │ │ Severity: ██ MED│ │     │
│             │  │ [___________]   ││  │ │ Active: 2h 15m  │ │     │
│             │  │                 ││  │ │                 │ │     │
│             │  │ Active Until:   ││  │ │ [Edit][Resolve] │ │     │
│             │  │ 📅 [date/time]  ││  │ └─────────────────┘ │     │
│             │  │                 ││  │                      │     │
│             │  │ [Clear]         ││  │ No more alerts✓  │     │
│             │  │ [Publish!]      ││  │                      │     │
│             │  └────────────────┘│  └──────────────────────┘     │
│             │                     │                                │
└─────────────┴─────────────────────┴────────────────────────────────┘
```

## User Alert Banner (Top of Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔥 Fire & Evacuation Alert: IMMEDIATE EVACUATION                 X │
│ Type: Fire Alert | Location: Building A, 3rd Floor | Severity:  ██ │
│                                                                     │
│ Description: Active fire detected. All occupants must evacuate    │
│              immediately using the nearest stairwell.              │
│                                                                     │
│ Instructions: 1. Leave building immediately                        │
│              2. Use nearest stairwell, NOT elevators              │
│              3. Meet at assembly point in parking lot             │
│              4. Do NOT re-enter the building                      │
│                                                                     │
│ Active for: 4h 25m                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Then all other page content appears below...
```

## Alert Type Icons & Colors

### Type Selection (Admin)
```
┌─────────────────────────────────────────┐
│ Type                                    │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐ │
│ │ 🔥 ││ 🚪 ││ ⚠️  ││ 🛡️ ││ 💧 ││ ⋯  │ │
│ │Fire││Evac││Hazd││Sec ││Flood││Othr│ │
│ └───┐┘└────┘└────┘└────┘└────┘└────┘ │
│    └─ Selected                         │
└─────────────────────────────────────────┘
```

### Severity Levels
```
┌────────────────────────────────┐
│ Severity                       │
│ ┌─────┐┌────┐┌──┐┌──────┐    │
│ │High ││Med ││Low││Critical│  │
│ │ 🔴  ││🟠  ││🟡 ││  🔴   │  │
│ └─────┘└────┘└──┘└──────┘    │
│                               │
│ Selected: High (🔴)           │
└────────────────────────────────┘
```

## Alert Card in Active Management

```
┌──────────────────────────────────────────────────────────┐
│ 🚪 Evacuation Required!                                  │
│ Type: evacuation  |  Location: Building B, All Floors    │
│ Severity: 🔴 HIGH                    Active for: 3h 45m  │
│                                                           │
│ Instructions: Evacuation protocol initiated. Follow       │
│ emergency exit signs. Do not use elevators. Assembly      │
│ point is in the south parking lot. Account for all        │
│ personnel.                                                │
│                                                           │
│ [Edit] 🟦  [Resolve] ✓  [Delete] 🔴                      │
└──────────────────────────────────────────────────────────┘
```

## Alert Banner Components

```
┌─────────────────────────────────────────────────────────────┐
│ ┌──┐  Alert Header                                       [X]│
│ │🔥│ ┌──────────────────────────────┐  ┌─────────────┐    │
│ │  │ │ Title: Fire & Evacuation     │  │ 🔴 CRITICAL │    │
│ │  │ │ [Fire Alert] Type Badge      │  └─────────────┘    │
│ │  │ └──────────────────────────────┘                      │
│ │  │                                                        │
│ │  │ Alert Body Content                                    │
│ │  │ ├─ Location: 3rd Floor, Building A                   │
│ │  │ └─ Active for: 2h 15m remaining                      │
│ │  │                                                        │
│ │  │ Description: Detailed information about alert       │
│ │  │                                                        │
│ │  │ Instructions:                                         │
│ │  │ └─ Follow emergency evacuation procedures            │
│ │  │                                                        │
│ └──┘                                                        │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme Reference

### Severity Color Palette

```
┌─ HIGH ────────────┐
│ 🔴 Red (#d32f2f)  │  Background: #ffcdd2
│ Alert icon color  │  Badge background
│ Border left color │
└───────────────────┘

┌─ MEDIUM ──────────┐
│ 🟠 Orange         │  Background: #ffe0b2
│ (#f57c00)         │  Badge background
│ Alert icon color  │
└───────────────────┘

┌─ LOW ─────────────┐
│ 🟡 Yellow         │  Background: #fff9c4
│ (#f9a825)         │  Badge background
│ Alert icon color  │
└───────────────────┘

┌─ CRITICAL ────────┐
│ 🔴 Dark Red       │  Background: #f8bbd0
│ (#c41c3b)         │  Badge background
│ Alert icon color  │
└───────────────────┘
```

## User Workflow

```
┌────────────────────────────────────────────────────────────┐
│                   USER EXPERIENCE                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. User Opens Any Campus Hub Page                          │
│         ↓                                                  │
│ 2. JavaScript Loads (emergency-alert-banner.js)           │
│         ↓                                                  │
│ 3. Check for Active Alerts (API Call)                     │
│         ↓                                                  │
│ 4. Display Banner at Top of Page                          │
│         ├─ If alerts exist                                │
│         └─ If no alerts: hide banner                      │
│         ↓                                                  │
│ 5. User Can:                                              │
│         ├─ Read alert details                             │
│         ├─ Follow instructions                            │
│         └─ Dismiss alert (visual only, doesn't delete)   │
│         ↓                                                  │
│ 6. Auto-Refresh Every 60 Seconds                          │
│         ├─ Checks for new/removed alerts                  │
│         └─ Updates display accordingly                    │
│         ↓                                                  │
│ 7. Alert Expires or Admin Mark Resolved                   │
│         ↓                                                  │
│ 8. Banner Auto-Hides                                      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Admin Workflow

```
┌────────────────────────────────────────────────────────────┐
│                  ADMIN EXPERIENCE                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Navigate to /Admin/emergency-alerts.html               │
│         ↓                                                  │
│ 2. Enter Alert Details                                    │
│    • Title, Type, Location                                │
│    • Severity, Description, Instructions                  │
│    • Active Until timestamp                               │
│         ↓                                                  │
│ 3. Click "Publish Instantly"                              │
│         ↓                                                  │
│ 4. Alert Stored in JSON File                              │
│    (Admin/shared/json/emergency-alerts.json)              │
│         ↓                                                  │
│ 5. Appears on Banner on All User Pages                    │
│    (30 seconds max, auto-refresh)                         │
│         ↓                                                  │
│ 6. Manage Active Alerts                                   │
│    • [Edit] - Modify & republish                          │
│    • [Resolve] - Hide from users                          │
│    • [Delete] - Remove permanently                        │
│         ↓                                                  │
│ 7. Auto-Cleanup                                           │
│    • Hides expired alerts automatically                   │
│    • Timer shows remaining time                           │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## File Dependencies

```
Pages
  ↑
  └─ emergency-alert-banner.js
       ↓
       └─ emergency-alert-banner.css
            ↓
            └─ Font Awesome Icons (CDN)
            └─ get-emergency-alerts.php
                 ↓
                 └─ emergency-alerts.json
```

## Mobile Responsive Layout

### Desktop (1200px+)
```
┌──────────────────────────────────────────────┐
│ ALERT BANNER FULL WIDTH                      │
├──────────────────────────────────────────────┤
│ PAGE CONTENT LEFT    │  SIDEBAR RIGHT        │
└──────────────────────────────────────────────┘
```

### Tablet (768px - 1199px)
```
┌────────────────────────────┐
│ ALERT BANNER FULL WIDTH    │
├────────────────────────────┤
│ STACKED                    │
│ PAGE CONTENT               │
│ SIDEBAR                    │
└────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────┐
│ ALERT BANNER     │
│ (Compact)        │
├──────────────────┤
│ PAGE CONTENT     │
└──────────────────┘
```

## Interaction States

### Hover States
```
Alert Card (Desktop)
├─ Hover → Slight shadow increase
│          Text color unchanged
│          Buttons highlight
```

### Button States
```
Regular Button
├─ Default → Gray (#ccc)
├─ Hover → Darker (#aaa)
└─ Active → Blue (#2c5aa0)

Delete Button
├─ Default → Orange
├─ Hover → Dark Orange
└─ Active → Pressed state

Edit Button  
├─ Default → Blue
├─ Hover → Dark Blue
└─ Active → Pressed state
```

### Dismiss State
```
Alert Card
├─ User clicks X
├─ Opacity → 0.5
├─ Pointer-events → none
├─ NOT deleted (stays on server)
└─ Next page refresh will show if still active
```

---

This visual guide should help team members understand the system architecture and user interface design.
