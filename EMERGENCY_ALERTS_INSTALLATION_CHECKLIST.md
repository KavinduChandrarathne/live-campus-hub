# Emergency Safety Alert System - Installation Checklist

## Pre-Installation Requirements

### Server Requirements
- [ ] PHP 7.4 or higher installed
- [ ] Apache or Nginx web server
- [ ] Write permissions on `/Admin/shared/json/` directory
- [ ] XAMPP/LAMP stack (for local development)

### Browser Requirements
- [ ] Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [ ] JavaScript enabled
- [ ] Cookies enabled (for session management)

---

## Installation Steps

### Step 1: Verify File Structure ✓
- [ ] `Admin/emergency-alerts.html` exists
- [ ] `Admin/javascript/emergency-alerts.js` exists
- [ ] `Admin/styles/emergency-alerts.css` exists
- [ ] `Admin/shared/php/` contains 4 PHP files
- [ ] `Admin/shared/json/emergency-alerts.json` exists
- [ ] `javascript/emergency-alert-banner.js` exists
- [ ] `styles/emergency-alert-banner.css` exists

### Step 2: Check Directory Permissions ✓
```bash
# Verify write permissions on JSON directory
ls -la Admin/shared/json/

# If needed, set permissions (Linux/Mac):
chmod 755 Admin/shared/json/
chmod 644 Admin/shared/json/emergency-alerts.json
```

For Windows:
- [ ] Right-click folder → Properties → Security
- [ ] Ensure IIS_IUSRS or IUSR has write permissions

### Step 3: Verify PHP Configuration ✓
- [ ] PHP can read/write files
- [ ] `file_get_contents()` enabled
- [ ] `file_put_contents()` enabled
- [ ] JSON functions available

Test with a simple PHP file:
```php
<?php
echo phpversion(); // Should show 7.4+
echo json_encode(['test' => 'success']); // Should work
?>
```

### Step 4: Test Admin Panel ✓
- [ ] Navigate to `/Admin/emergency-alerts.html`
- [ ] Page loads without errors
- [ ] CSS styling applied correctly
- [ ] Form fields visible and working
- [ ] Sidebar navigation appears

### Step 5: Test Alert Creation ✓
1. [ ] Fill in alert form
2. [ ] Click "Publish Instantly"
3. [ ] Success message appears
4. [ ] Alert appears in right panel
5. [ ] Check browser console for errors (F12)

### Step 6: Test API Endpoints ✓
Test in browser console or Postman:

```javascript
// Test API availability
fetch('Admin/shared/php/get-emergency-alerts.php')
  .then(r => r.json())
  .then(d => console.log(d))
```

- [ ] GET request returns JSON
- [ ] Response has `success` field
- [ ] `alerts` array present
- [ ] No CORS errors

### Step 7: Test User Banner ✓
1. [ ] Open any user page (dashboard.html, clubs.html, etc.)
2. [ ] Banner CSS loads (hover over banner to check)
3. [ ] JavaScript loads (check Network tab, F12)
4. [ ] If alerts exist, banner displays
5. [ ] Alert content shows correctly
6. [ ] Icons render properly
7. [ ] Colors match design

### Step 8: Test Banner Functionality ✓
- [ ] X button dismisses alert
- [ ] Dismiss reduces opacity
- [ ] Refresh page shows active alerts again
- [ ] Wait 60 seconds for auto-refresh
- [ ] New alerts appear after refresh

### Step 9: Test Mobile Responsiveness ✓
Open pages on mobile device or use DevTools:

- [ ] Admin panel responsive (tablet view)
- [ ] Alert banner responsive (mobile view)
- [ ] Touch interactions work
- [ ] Text readable at all sizes
- [ ] Icons display correctly

### Step 10: Test Browser Compatibility ✓
For each supported browser:
- [ ] Chrome - No console errors
- [ ] Firefox - No console errors
- [ ] Safari - No console errors
- [ ] Edge - No console errors

---

## Security Configuration

### Before Going Live

- [ ] Add authentication to `/Admin/emergency-alerts.html`
- [ ] Verify admin-only access control
- [ ] Set up `.htaccess` to restrict `/Admin/` access
- [ ] Use HTTPS for all connections
- [ ] Validate user is admin before allowing operations
- [ ] Test with non-admin user (should not see admin panel)

### File Permissions (Security)
```bash
# Admin directory - restrictive
chmod 750 Admin/
chmod 750 Admin/shared/
chmod 750 Admin/shared/php/
chmod 644 Admin/shared/json/emergency-alerts.json

# User files - readable
chmod 644 javascript/emergency-alert-banner.js
chmod 644 styles/emergency-alert-banner.css
```

### .htaccess Protection (Optional)
```apache
# Protect admin panel
<Directory "/path/to/Admin">
    Require IP 192.168.1.0/24
    # Or use authentication:
    AuthType Basic
    AuthName "Admin Only"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Directory>
```

---

## Testing Scenarios

### Test 1: Create Alert
- [ ] Form validates required fields
- [ ] Can't submit empty form
- [ ] Success message appears
- [ ] Alert appears immediately
- [ ] Alert shows on all pages within 60 seconds

### Test 2: Edit Alert
- [ ] Click Edit button
- [ ] Form populates with current data
- [ ] Can modify any field
- [ ] Submit updates alert
- [ ] Changes visible immediately

### Test 3: Resolve Alert
- [ ] Click Resolve button
- [ ] Alert disappears from active list
- [ ] Alert removed from user pages
- [ ] Alert still in JSON file (status: resolved)

### Test 4: Delete Alert
- [ ] Click Delete button
- [ ] Confirmation dialog appears
- [ ] Can cancel deletion
- [ ] Confirmed deletion removes alert
- [ ] No longer visible anywhere

### Test 5: Alert Expiration
- [ ] Create alert with short duration (5 minutes)
- [ ] Wait for time to pass
- [ ] Alert automatically disappears
- [ ] No manual intervention needed

### Test 6: Multiple Alerts
- [ ] Create 3 different alerts
- [ ] All appear on banner
- [ ] Each is dismissible separately
- [ ] Edit one doesn't affect others
- [ ] Delete one doesn't affect others

### Test 7: Severe Types
- [ ] Test each alert type (Fire, Evacuation, etc.)
- [ ] Correct icon displays
- [ ] Correct color displays
- [ ] Alert type badge correct

### Test 8: All Severities
- [ ] Test High severity - Red color
- [ ] Test Medium severity - Orange color
- [ ] Test Low severity - Yellow color
- [ ] Test Critical severity - Dark red color

---

## Troubleshooting Guide

### Problem: Alert doesn't save
**Solution:**
- [ ] Check JSON file write permissions
- [ ] Verify `/Admin/shared/json/` directory exists
- [ ] Check server error logs
- [ ] Verify PHP file_put_contents() works
- [ ] Check browser console for API errors

### Problem: Banner doesn't appear on pages
**Solution:**
- [ ] Verify CSS file linked: `<link rel="stylesheet" href="./styles/emergency-alert-banner.css">`
- [ ] Verify JS file loaded: `<script src="javascript/emergency-alert-banner.js"></script>`
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Check Network tab (F12) for 404 errors
- [ ] Ensure correct file paths

### Problem: Icons not showing
**Solution:**
- [ ] Verify Font Awesome CDN loads
- [ ] Check Network tab for Font Awesome URL
- [ ] Verify CDN not blocked by firewall
- [ ] Try offline icon set (optional)

### Problem: Styling looks broken
**Solution:**
- [ ] Check CSS file loads (inspect element)
- [ ] Clear browser cache
- [ ] Check for CSS conflicts
- [ ] Verify responsive breakpoints
- [ ] Check mobile viewport settings

### Problem: API calls fail (404/500)
**Solution:**
- [ ] Verify PHP files exist in correct path
- [ ] Check server logs for errors
- [ ] Verify correct URL paths in JavaScript
- [ ] Test API directly: `/Admin/shared/php/get-emergency-alerts.php`
- [ ] Check PHP error reporting enabled

### Problem: Form not submitting
**Solution:**
- [ ] Check form validation (required fields)
- [ ] Check browser console for errors
- [ ] Verify type and severity selected
- [ ] Check date/time picker (must have value)
- [ ] Verify POST not blocked (check proxy settings)

---

## Performance Checklist

- [ ] Admin page loads in < 1 second
- [ ] Banner loads in < 500ms
- [ ] API response < 200ms
- [ ] No console warnings
- [ ] No JS errors
- [ ] CSS doesn't block rendering
- [ ] Mobile performance acceptable
- [ ] Auto-refresh doesn't cause flicker

---

## Documentation Checklist

- [ ] Read EMERGENCY_ALERTS_QUICKSTART.md
- [ ] Review EMERGENCY_ALERTS_DOCUMENTATION.md
- [ ] Check EMERGENCY_ALERTS_VISUAL_GUIDE.md
- [ ] Share with team members
- [ ] Update internal wiki/docs
- [ ] Create user training materials
- [ ] Document any customizations

---

## Deployment Checklist

### Before Going Live

- [ ] All tests passed
- [ ] Security measures implemented
- [ ] File permissions set correctly
- [ ] Backups created
- [ ] Admin password set
- [ ] HTTPS configured
- [ ] Error logging enabled
- [ ] Monitoring set up

### After Going Live

- [ ] Test on production
- [ ] Verify all alerts display
- [ ] Create test alert
- [ ] Monitor for errors (first 24h)
- [ ] Notify admins of location
- [ ] Update FAQs/help docs
- [ ] Monitor performance
- [ ] Get user feedback

---

## Maintenance Tasks

### Weekly
- [ ] Check error logs
- [ ] Test alert creation
- [ ] Verify all pages load
- [ ] Monitor performance

### Monthly
- [ ] Review alert history
- [ ] Check JSON file size
- [ ] Test all browsers
- [ ] Backup data

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] User feedback collection
- [ ] Feature requests review

---

## Success Criteria

✅ **Installation Successful When:**

1. Admin panel loads without errors
2. Can create and publish alerts
3. Alerts appear on all user pages
4. Users can dismiss alerts
5. Alerts auto-expire correctly
6. Mobile view responsive
7. All browsers supported
8. No JavaScript errors
9. No security issues
10. Performance acceptable

---

## Quick Reference

### Common URLs
- Admin Panel: `/Admin/emergency-alerts.html`
- API: `/Admin/shared/php/get-emergency-alerts.php`
- Data: `/Admin/shared/json/emergency-alerts.json`
- CSS: `/styles/emergency-alert-banner.css`
- JS: `/javascript/emergency-alert-banner.js`

### Default Settings
- Refresh interval: 60 seconds (configurable)
- Alert storage: Last 100 alerts
- Auto-expiration: When "Active Until" time reached
- Responsive breakpoints: 768px, 480px

### Files to Never Modify Without Backup
- `.json` data file (contains all alerts)
- `add-emergency-alert.php` (creation logic)
- `get-emergency-alerts.php` (retrieval logic)

---

## Sign-Off

- [ ] Installation completed
- [ ] All tests passed
- [ ] Team trained
- [ ] Documentation reviewed
- [ ] Go-live approved

**Installed By**: ___________________  
**Date**: ___________________  
**Verified By**: ___________________  
**Date**: ___________________  

---

**Status**: Ready for Production ✅

For questions, refer to the comprehensive documentation files or contact the development team.
