# Emergency Safety Alert System - Quick Start

## What's New?

A complete Emergency Safety Alert System has been implemented for Campus Hub.

### ✨ Features

✅ **Admin Panel** - Create, edit, delete, and manage emergency alerts  
✅ **User Alert Banner** - Fixed alert display on all user pages  
✅ **Smart Expiration** - Alerts auto-remove when time expires  
✅ **Color-Coded Severity** - High, Medium, Low, Critical levels  
✅ **Multiple Alert Types** - Fire, Evacuation, Hazard, Security, Flood, Other  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Real-time Updates** - Auto-refresh every 60 seconds  
✅ **Easy Integration** - Already added to all user pages  

---

## Access the System

### For Admins
1. Go to: `/Admin/emergency-alerts.html`
2. Login with admin credentials
3. Use the form on the left to create alerts
4. Manage active alerts on the right

### For Users
- Alerts automatically appear at the top of every page
- Users can dismiss individual alerts
- Banner updates automatically

---

## Quick Setup

### Nothing to do! The system is already integrated.

All files have been created and added to the following locations:

#### Admin Files (Private)
```
Admin/
├── emergency-alerts.html
├── javascript/emergency-alerts.js
├── styles/emergency-alerts.css
└── shared/
    ├── json/emergency-alerts.json
    └── php/
        ├── add-emergency-alert.php
        ├── get-emergency-alerts.php
        ├── delete-emergency-alert.php
        └── resolve-emergency-alert.php
```

#### User-Facing Files (Public)
```
javascript/
└── emergency-alert-banner.js

styles/
└── emergency-alert-banner.css

# Auto-integrated into:
dashboard.html, clubs.html, facility.html, transit.html, 
updates.html, calendar.html, profile.html, rewards.html, 
bus-route.html, club-detail.html, location-updates.html, 
facility-event-updates.html, signup.html, index.html
```

---

## How to Use

### Creating an Alert

1. Navigate to `/Admin/emergency-alerts.html`
2. Fill in the form:
   - **Title**: Brief emergency summary
   - **Type**: Select from 6 types (Fire, Evacuation, etc.)
   - **Location**: Campus location (e.g., "3rd Floor, Building A")
   - **Severity**: High/Medium/Low/Critical
   - **Description**: Details about the emergency
   - **Instructions**: What users should do
   - **Active Until**: When alert expires
3. Click **"Publish Instantly"**

### Managing Alerts

In the right panel, for each active alert:
- 📝 **Edit** - Modify and republish
- ✓ **Resolve** - Mark as handled (hides from users)
- 🗑️ **Delete** - Permanently remove

---

## Alert Banner Design

The user-facing banner includes:
- **Icon** - Type-specific emoji/icon
- **Title** - Alert headline
- **Type Badge** - Color-coded type label
- **Location** - Where the emergency is
- **Description** - What's happening
- **Instructions** - What to do
- **Severity Badge** - Visual urgency indicator
- **Timer** - How long alert is active
- **Dismiss** - Users can close individual alerts

---

## Color Scheme

| Severity | Color | Meaning |
|----------|-------|---------|
| 🔴 High | Red (#d32f2f) | Urgent safety issue |
| 🟠 Medium | Orange (#f57c00) | Important alert |
| 🟡 Low | Yellow (#f9a825) | Informational |
| 🔴 Critical | Dark Red (#c41c3b) | Life-threatening |

---

## Technical Details

### Data Storage
- **Format**: JSON
- **Location**: `Admin/shared/json/emergency-alerts.json`
- **Auto-cleanup**: Keeps last 100 alerts, expires old ones

### Alert Refresh
- User pages check for new alerts every **60 seconds**
- Configurable in `emergency-alert-banner.js`

### API Responses
All endpoints return JSON:
```json
{
  "success": true,
  "message": "Success message",
  "alerts": [...]
}
```

---

## Security Notes

⚠️ **Important**: Before deploying to production:

1. **Add Authentication** to `/Admin/emergency-alerts.html`
2. **Restrict Access** to admin PHP files (use htaccess or middleware)
3. **Set File Permissions** for JSON storage correctly
4. **Validate Inputs** on the server side
5. **Use HTTPS** for all connections

---

## Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers  

---

## Troubleshooting

### Alerts not showing?
- Check browser console (F12 → Console)
- Verify `emergency-alert-banner.js` loaded
- Check server logs for PHP errors

### Not updating?
- Wait 60 seconds for refresh
- Manually refresh the page
- Check Network tab for API calls

### Styling looks wrong?
- Clear browser cache (Ctrl+Shift+Del)
- Check CSS file is loading
- Verify Font Awesome icons loaded

---

## Customization

### Change Refresh Interval
Edit `emergency-alert-banner.js`, line ~85:
```javascript
setInterval(() => this.loadAlerts(), 60000); // Change 60000 to milliseconds
```

### Add Custom Icons
Edit `getTypeIcon()` method in `emergency-alert-banner.js`

### Change Colors
Edit `emergency-alert-banner.css` severity badge colors

### Adjust Banner Position
In `emergency-alert-banner.css`, modify `#emergency-alert-banner` styling

---

## Files Modified

✏️ 14 user pages updated with alert banner integration  
✏️ CSS and JavaScript auto-loaded on all pages  

---

## Documentation

📖 **Full Documentation**: See `EMERGENCY_ALERTS_DOCUMENTATION.md`

---

## Questions?

Refer to the full documentation or check the code comments in:
- `Admin/javascript/emergency-alerts.js` (Admin logic)
- `javascript/emergency-alert-banner.js` (User banner)
- CSS files for styling details

---

**Status**: ✅ Ready to Use  
**Last Updated**: April 2024  
**Version**: 1.0
