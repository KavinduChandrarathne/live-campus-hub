import json
path = 'Admin/shared/json/users.json'
with open(path, 'r', encoding='utf-8') as f:
    users = json.load(f)
for u in users:
    u.setdefault('rewards', {})
    u['rewards'].update({
        'points': 0,
        'badges': 0,
        'tier': 'BRONZE',
        'pointsToNext': 100,
        'nextTier': 'SILVER',
        'loginStreak': 0,
        'lastLoginDate': '',
        'dailyUsagePoints': 0,
        'dailyUsageDate': ''
    })
with open(path, 'w', encoding='utf-8') as f:
    json.dump(users, f, indent=4)
print('users reset')