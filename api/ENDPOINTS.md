# CampusHub API Documentation

All new API endpoints are exposed under the `/api` folder.

## Authentication

### POST `/api/login`

- Required parameters: `email`, `password`
- Request type: `POST`
- Body: `application/json`
- Response:
  - `success`: boolean
  - `token`: JWT string
  - `user`: full user profile

Example request:

```http
POST /api/login
Content-Type: application/json

{
  "email": "alice@campushub.com",
  "password": "password123"
}
```

Example response:

```json
{
  "success": true,
  "token": "<jwt-token>",
  "user": {
    "id": 1,
    "username": "aliceanderson",
    "email": "alice@campushub.com",
    "firstName": "Alice",
    "lastName": "Anderson",
    "studentId": "S1001",
    "role": "student",
    "picture": "./images/person1.png",
    "joinedClubs": ["Coding Club"],
    "joinedRoutes": ["Gampaha"],
    "rewards": { "points": 45, "badges": 0, "tier": "BRONZE" }
  }
}
```

### POST `/api/signup`

- Required parameters: `firstName`, `lastName`, `faculty`, `studentId`, `dob`, `email`, `password`
- Request type: `POST`
- Body: `application/json`
- Response:
  - `success`: boolean
  - `message`: string
  - `token`: JWT string (on success)

Example request:

```http
POST /api/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "faculty": "Engineering",
  "studentId": "S12345",
  "dob": "2000-01-01",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Example response:

```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "<jwt-token>"
}
```

## Users

### GET `/api/users/current`

- Requires `Authorization: Bearer <token>` header.
- Returns the current authenticated user's profile.
- Response includes membership and rewards data.

### GET `/api/users?studentId=<id>`

- Requires `Authorization: Bearer <token>`.
- Returns a single user matching the provided `studentId`.

### GET `/api/users?email=<email>`

- Requires `Authorization: Bearer <token>`.
- Returns a single user matching the provided email.

### GET `/api/users?search=<query>`

- Requires `Authorization: Bearer <token>`.
- Admin-only endpoint.
- Returns up to 100 matching users.

### GET `/api/users`

- Requires `Authorization: Bearer <token>`.
- Admin-only endpoint.
- Returns all users.

## Clubs

### GET `/api/clubs`

- Public endpoint.
- Returns club list.

## Emergency Alerts

### GET `/api/alerts`

- Public endpoint.
- Returns active emergency alerts.

## Facility Updates

### GET `/api/facility-updates`

- Public endpoint.
- Returns facility event update feed.

## Club Updates

### GET `/api/club-updates?studentId=<id>`

- Requires `Authorization: Bearer <token>`.
- Returns updates for clubs the specified student belongs to.

### GET `/api/club-updates?clubName=<name>`

- Returns updates for a specific club.

### GET `/api/club-updates`

- Admin-only endpoint.
- Returns all club updates.

## Transit Updates

### GET `/api/transit-updates?route=<name>`

- Public endpoint.
- Returns transit updates for the specified route.

## Notifications

### GET `/api/notifications`

- Requires `Authorization: Bearer <token>`.
- Returns direct and facility notifications plus club notifications for the authenticated user.

## Club Join Requests

### GET `/api/club-join-requests`

- Requires `Authorization: Bearer <token>`.
- Admin-only endpoint.
- Returns pending club join requests.

## Transit Join Requests

### GET `/api/transit-join-requests?username=<username>`

- Requires `Authorization: Bearer <token>`.
- If the token belongs to a student, the token user is returned automatically.
- Admins may pass `username` to fetch a specific user requests.
