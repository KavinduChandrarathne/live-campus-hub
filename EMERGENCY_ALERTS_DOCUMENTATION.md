# Emergency Safety Alert System - Implementation Guide

## Overview

The Emergency Safety Alert System is a comprehensive solution for managing critical campus safety incidents. It includes an admin panel for creating and managing alerts, and a user-facing alert banner that displays on all pages.

## Features

### Admin Panel (`Admin/emergency-alerts.html`)

#### Alert Creation Form
- **Title**: Alert headline
- **Type Selection**: Fire, Evacuation, Dangerous Situation, Security Incident, Flood, Other
- **Location**: Specific location on campus
- **Description**: Detailed information about the alert
- **Severity Level**: High, Medium, Low, Critical
- **Instructions**: Safety instructions for users
- **Active Until**: Timestamp for when the alert expires

#### Admin Actions
- **Publish Instantly**: Create and immediately publish an alert
- **Edit**: Modify active alerts
- **Resolve**: Mark an alert as resolved (removes from active view)
- **Delete**: Remove an alert entirely
- **View History**: See all active and past alerts

### User Interface

#### Alert Banner Display
- Fixed at the top of all pages
- High-visibility design with color-coded severity
- Displays:
  - Alert type with icon
  - Title
  - Location
  - Description
  - Instructions
  - Time remaining
  - Severity badge
- Responsive design for mobile devices
- Dismissible per alert

## File Structure

### Admin Files
```
Admin/
├── emergency-alerts.html          # Admin panel interface
├── javascript/
│   └── emergency-alerts.js        # Admin functionality
├── styles/
│   └── emergency-alerts.css       # Admin styling
└── shared/
    ├── json/
    │   └── emergency-alerts.json  # Alert data storage
    └── php/
        ├── add-emergency-alert.php       # Create alert
        ├── get-emergency-alerts.php      # Retrieve active alerts
        ├── delete-emergency-alert.php    # Delete alert
        └── resolve-emergency-alert.php   # Mark as resolved
```

### User-Facing Files
```
javascript/
├── emergency-alert-banner.js      # Banner functionality
styles/
└── emergency-alert-banner.css    # Banner styling

# Integrated into all user pages:
├── dashboard.html
├── clubs.html
├── facility.html
├── transit.html
├── updates.html
├── calendar.html
├── profile.html
├── rewards.html
├── bus-route.html
├── club-detail.html
├── location-updates.html
├── facility-event-updates.html
├── signup.html
└── index.html
```

## Usage Guide

### For Admins

1. **Navigate to Emergency Alerts**
   - From admin sidebar, click "Emergency Alerts"
   - Or go to `/Admin/emergency-alerts.html`

2. **Create an Alert**
   - Fill in Title, Location, and Description
   - Select alert Type using icon buttons
   - Choose Severity level
   - Add Instructions for users
   - Set "Active Until" date/time
   - Click "Publish Instantly"

3. **Manage Active Alerts**
   - View all active alerts in the right panel
   - **Edit**: Modify alert details and republish
   - **Resolve**: Mark as resolved (hidden from users)
   - **Delete**: Permanently remove the alert
   - Alerts auto-remove when "Active Until" time expires

### For Users

- Alerts automatically appear at the top of all pages
- Banner updates every 60 seconds to check for new alerts
- Click the X button to dismiss individual alerts
- Alert severity colors indicate urgency:
  - **High** (Red): Urgent safety issue
  - **Medium** (Orange): Important alert
  - **Low** (Yellow): Informational
  - **Critical** (Dark Red): Life-threatening situation

## Technical Details

### Data Storage

Alerts are stored in JSON format at:
```
Admin/shared/json/emergency-alerts.json
```

Each alert object contains:
```json
{
  "id": "alert_unique_id",
  "title": "Alert Title",
  "type": "fire|evacuation|hazard|security|flood|other",
  "location": "Building/Floor",
  "description": "Detailed description",
  "severity": "high|medium|low|critical",
  "instructions": "Safety instructions",
  "activeUntil": "2024-04-10T14:00:00Z",
  "createdAt": "2024-04-10T12:00:00Z",
  "status": "active|resolved"
}
```

### API Endpoints

All requests use JSON format. Base path: `Admin/shared/php/`

#### Add Emergency Alert
- **File**: `add-emergency-alert.php`
- **Method**: POST
- **Body**:
  ```json
  {
    "title": "string",
    "type": "fire|evacuation|hazard|security|flood|other",
    "location": "string",
    "description": "string",
    "severity": "high|medium|low|critical",
    "instructions": "string",
    "activeUntil": "ISO8601 datetime string"
  }
  ```

#### Get Active Alerts
- **File**: `get-emergency-alerts.php`
- **Method**: GET
- **Response**:
  ```json
  {
    "success": true,
    "alerts": [...]
  }
  ```

#### Delete Alert
- **File**: `delete-emergency-alert.php`
- **Method**: POST
- **Body**: `{"id": "alert_id"}`

#### Resolve Alert
- **File**: `resolve-emergency-alert.php`
- **Method**: POST
- **Body**: `{"id": "alert_id"}`

## Styling

### Admin Panel Colors
- Primary: `#2c5aa0` (Blue)
- Danger: `#d32f2f` (Red)
- Background: `#f5f5f5` (Light Gray)

### Alert Severity Colors
- **High**: `#d32f2f` (Red)
- **Medium**: `#f57c00` (Orange)
- **Low**: `#f9a825` (Yellow)
- **Critical**: `#c41c3b` (Dark Red)

### Banner Alert Types
- Fire: `<i class="fas fa-fire"></i>`
- Evacuation: `<i class="fas fa-person-walking"></i>`
- Hazard: `<i class="fas fa-triangle-exclamation"></i>`
- Security: `<i class="fas fa-shield"></i>`
- Flood: `<i class="fas fa-water"></i>`
- Other: `<i class="fas fa-exclamation-triangle"></i>`

## Security Considerations

1. **Access Control**: Implement authentication/authorization in admin panel
2. **Input Validation**: All user inputs are HTML-escaped before storage
3. **CORS**: API endpoints can be restricted to same-origin requests
4. **File Permissions**: Ensure JSON file is writable by web server
5. **Admin Panel**: Protect `/Admin/emergency-alerts.html` with authentication

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast severity colors
- Semantic HTML structure
- Icon labels in tooltips

## Performance

- Lightweight banner script (~3KB minified)
- CSS that doesn't block rendering
- Efficient JSON parsing
- Client-side filtering of expired alerts
- 60-second refresh interval (configurable)

## Troubleshooting

### Alerts Not Appearing
1. Check browser console for errors
2. Verify `emergency-alert-banner.js` is loaded
3. Check that JSON file has read permissions
4. Verify alerts have future "activeUntil" times

### Alerts Not Updating
1. Check if refresh interval has passed (60 seconds default)
2. Verify server is running and accessible
3. Check browser's Network tab for API calls
4. Check server error logs

### Styling Issues
1. Ensure `emergency-alert-banner.css` is loaded
2. Check for CSS conflicts with other stylesheets
3. Verify Font Awesome icons are loading
4. Check responsive breakpoints for mobile

## Future Enhancements

- [ ] Sound notifications for critical alerts
- [ ] Email notifications for users
- [ ] Alert scheduling (scheduled alerts)
- [ ] Alert templates for common scenarios
- [ ] Alert analytics and reporting
- [ ] Multi-language support
- [ ] Database integration (MySQL/PostgreSQL)
- [ ] User notification preferences
- [ ] Alert escalation levels
- [ ] Mobile push notifications

## Integration Notes

To add the alert system to a new page:

1. Add CSS link in `<head>`:
   ```html
   <link rel="stylesheet" href="./styles/emergency-alert-banner.css">
   ```

2. Add JavaScript before closing `</body>`:
   ```html
   <script src="javascript/emergency-alert-banner.js"></script>
   ```

The banner will automatically initialize and display any active alerts.

## Support

For issues or questions, please check:
- Browser console for error messages
- Server error logs
- File permissions on JSON storage file
- Network connectivity to API endpoints
