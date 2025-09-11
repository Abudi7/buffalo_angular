# API Documentation

## Base URL

- **Development**: `http://localhost:8087`
- **Staging**: `https://staging-api.timetrac.com`
- **Production**: `https://api.timetrac.com`

## Authentication

All API endpoints (except registration and login) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**

- `400` - Invalid input data
- `409` - Email already exists

### Login User

**POST** `/api/auth/login`

Authenticate user and return JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Error Responses:**

- `400` - Invalid input data
- `401` - Invalid credentials

### Get Current User

**GET** `/api/auth/me`

Get current authenticated user information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "User retrieved successfully"
}
```

**Error Responses:**

- `401` - Unauthorized (invalid or missing token)

### Logout User

**POST** `/api/auth/logout`

Invalidate current JWT token.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

## Time Tracking Endpoints

### Start Time Tracking

**POST** `/api/timetrac/start`

Start a new time tracking session.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "project": "Web Development",
  "tags": ["frontend", "angular"],
  "note": "Working on user interface",
  "color": "#22c55e"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Web Development",
    "tags": ["frontend", "angular"],
    "note": "Working on user interface",
    "color": "#22c55e",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": null,
    "duration": null,
    "location_lat": 40.7128,
    "location_lng": -74.006,
    "location_addr": "New York, NY, USA",
    "photo_url": null,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  },
  "message": "Time tracking started successfully"
}
```

### Stop Time Tracking

**POST** `/api/timetrac/stop`

Stop the current time tracking session.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "note": "Completed user interface work"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Web Development",
    "tags": ["frontend", "angular"],
    "note": "Completed user interface work",
    "color": "#22c55e",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "duration": 7200,
    "location_lat": 40.7128,
    "location_lng": -74.006,
    "location_addr": "New York, NY, USA",
    "photo_url": null,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Time tracking stopped successfully"
}
```

### Get Time Entries

**GET** `/api/timetrac/entries`

Get paginated list of time entries for the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `project` (optional): Filter by project name
- `start_date` (optional): Filter entries from this date (ISO 8601)
- `end_date` (optional): Filter entries to this date (ISO 8601)

**Example:**

```
GET /api/timetrac/entries?page=1&limit=10&project=Web%20Development
```

**Response:**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "project": "Web Development",
        "tags": ["frontend", "angular"],
        "note": "Working on user interface",
        "color": "#22c55e",
        "start_time": "2024-01-01T10:00:00Z",
        "end_time": "2024-01-01T12:00:00Z",
        "duration": 7200,
        "location_lat": 40.7128,
        "location_lng": -74.006,
        "location_addr": "New York, NY, USA",
        "photo_url": "https://example.com/photo.jpg",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "message": "Time entries retrieved successfully"
}
```

### Get Single Time Entry

**GET** `/api/timetrac/entries/{id}`

Get a specific time entry by ID.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Web Development",
    "tags": ["frontend", "angular"],
    "note": "Working on user interface",
    "color": "#22c55e",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "duration": 7200,
    "location_lat": 40.7128,
    "location_lng": -74.006,
    "location_addr": "New York, NY, USA",
    "photo_url": "https://example.com/photo.jpg",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Time entry retrieved successfully"
}
```

### Update Time Entry

**PUT** `/api/timetrac/entries/{id}`

Update an existing time entry.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "project": "Updated Project Name",
  "tags": ["updated", "tags"],
  "note": "Updated note",
  "color": "#ff6b6b"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Updated Project Name",
    "tags": ["updated", "tags"],
    "note": "Updated note",
    "color": "#ff6b6b",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "duration": 7200,
    "location_lat": 40.7128,
    "location_lng": -74.006,
    "location_addr": "New York, NY, USA",
    "photo_url": "https://example.com/photo.jpg",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T13:00:00Z"
  },
  "message": "Time entry updated successfully"
}
```

### Delete Time Entry

**DELETE** `/api/timetrac/entries/{id}`

Delete a time entry.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Time entry deleted successfully"
}
```

### Export Time Entries

**GET** `/api/timetrac/export`

Export time entries as CSV.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `start_date` (optional): Export entries from this date (ISO 8601)
- `end_date` (optional): Export entries to this date (ISO 8601)
- `format` (optional): Export format (csv, json) - default: csv

**Response:**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="timetrac_export_2024-01-01.csv"

Date,Project,Tags,Note,Duration (minutes),Location,Start Time,End Time
2024-01-01,Web Development,"frontend,angular",Working on user interface,120,"New York, NY, USA",10:00:00,12:00:00
```

## Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Human readable error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Time tracking endpoints**: 100 requests per minute per user
- **General endpoints**: 1000 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Time Entry Created

**POST** to configured webhook URL

**Payload:**

```json
{
  "event": "time_entry.created",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Web Development",
    "start_time": "2024-01-01T10:00:00Z",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### Time Entry Completed

**POST** to configured webhook URL

**Payload:**

```json
{
  "event": "time_entry.completed",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "project": "Web Development",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "duration": 7200,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @timetrac/api-client
```

```typescript
import { TimeTracAPI } from "@timetrac/api-client";

const api = new TimeTracAPI({
  baseURL: "https://api.timetrac.com",
  token: "your-jwt-token",
});

// Start time tracking
const entry = await api.timeTracking.start({
  project: "Web Development",
  tags: ["frontend"],
  note: "Working on UI",
});
```

### Go

```bash
go get github.com/timetrac/go-client
```

```go
package main

import (
    "github.com/timetrac/go-client"
)

func main() {
    client := timetrac.NewClient("https://api.timetrac.com", "your-jwt-token")

    entry, err := client.TimeTracking.Start(timetrac.StartRequest{
        Project: "Web Development",
        Tags:    []string{"frontend"},
        Note:    "Working on UI",
    })
}
```

## Testing

### Postman Collection

Import the TimeTrac API Postman collection for easy testing:
[Download Collection](https://api.timetrac.com/docs/postman-collection.json)

### cURL Examples

#### Register User

```bash
curl -X POST https://api.timetrac.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123"}'
```

#### Login User

```bash
curl -X POST https://api.timetrac.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123"}'
```

#### Start Time Tracking

```bash
curl -X POST https://api.timetrac.com/api/timetrac/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project":"Web Development","tags":["frontend"],"note":"Working on UI"}'
```

#### Get Time Entries

```bash
curl -X GET https://api.timetrac.com/api/timetrac/entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
