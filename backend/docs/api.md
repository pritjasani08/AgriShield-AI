# AgriShield AI Backend API

## Base Path: `/api/v1`
*All endpoints are strictly versioned.*

### Health Check
- `GET /api/v1/health`: Returns server status, database status, uptime, environment, app version, and request ID.

### Dashboard
- `GET /api/v1/dashboard/summary`: Retrieves aggregated dashboard metrics, charts, distribution, and quick actions. **Requires Authentication header (`Bearer <token>`)**.

### Detection
- `POST /api/v1/detections/analyze`: Submits an image for AI processing. Expects `multipart/form-data` with an `image` file. Returns an array of detections, bounding boxes, and system recommendations. **Requires Authentication header**.

### Analytics
- `GET /api/v1/analytics/summary`: Retrieves aggregated analytics data including trends, distribution, and security score. **Requires Authentication header (`Bearer <token>`)**.

### Authentication
- `POST /api/v1/auth/signup`: Create a new user account. Expects `mobile`, `password`, `firstName`, `lastName`, and optional `email`. Returns User and JWT. (Mobile-first)
- `POST /api/v1/auth/login`: Authenticate an existing user. Expects `mobile`, `password`. Returns User and JWT.
- `POST /api/v1/auth/logout`: Discards session.
- `GET /api/v1/auth/me`: Retrieves current user profile. **Requires Authentication header (`Bearer <token>`)**.

### Profile
- `GET /api/v1/profile`: Retrieves the full user profile including farm details. **Requires Authentication header**.
- `PUT /api/v1/profile`: Updates the user profile. Accepts partial updates (e.g. `phone`, `village`, `farmSize`). **Requires Authentication header**.

### Settings
- `GET /api/v1/settings`: Retrieves the user's application settings. **Requires Authentication header**.
- `PUT /api/v1/settings`: Updates the user's settings. Accepts partial updates (e.g. `language`, `theme`, `alertVolume`). **Requires Authentication header**.

### Notifications
- `GET /api/v1/notifications`: Retrieves paginated notifications (query: `?page=1&limit=20&isRead=false&type=DETECTION`). **Requires Auth**.
- `GET /api/v1/notifications/unread`: Retrieves all unread notifications. **Requires Auth**.
- `PATCH /api/v1/notifications/:id/read`: Marks a single notification as read. **Requires Auth**.
- `PATCH /api/v1/notifications/read-all`: Marks all notifications as read. **Requires Auth**.
- `DELETE /api/v1/notifications/:id`: Deletes a notification. **Requires Auth**.
- `POST /api/v1/device-tokens`: Registers a device token for push notifications (body: `deviceToken`, `platform`, `deviceName`, `appVersion`). **Requires Auth**.
- `DELETE /api/v1/device-tokens/:id`: Removes a device token. **Requires Auth**.

### Standard Response Format
Every endpoint guarantees this `ApiResponse` format:
```json
{
  "success": true,
  "message": "Action successful",
  "data": {}
}
```

(More endpoints will be documented as feature modules are developed)
