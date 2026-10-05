# AgriShield AI Backend Architecture

## Overview
The backend uses a strict Layered Architecture inside feature-based modules:
- `src/modules/dashboard`: Real-time dashboard aggregates
- `src/modules/detection`: Animal detection ingestion
- `src/modules/health`: Basic health checks
- `src/modules/profile`: User profile management
- `src/modules/settings`: Application preferences
- `src/modules/notification`: Notification logic and device tracking
- `src/modules/auth`: Mobile-first JWT authentication

### Authentication Lifecycle
The auth flow is strictly mobile-first. Registration requires a 10-digit `mobile` number and emits a `USER_REGISTERED` event which downstream triggers automatic Profile, Settings, and Welcome Notification initializations without tying that logic back into the Auth Controller. `email` is purely optional. The frontend manages session persistence via `AuthStorage` and React Query to `/auth/me`.

### Notification Dispatch Flow
Notifications are deeply decoupled.

```mermaid
flowchart TD
    A[Detection Module] -->|Emits DETECTION_CREATED| B(DomainEvents)
    B --> C[NotificationService]
    C -->|Stores in DB| D[(PostgreSQL)]
    C -->|Emits NOTIFICATION_CREATED| E(DomainEvents)
    E --> F[NotificationDispatcher]
    F -->|Fetches Preferences| G[SettingsRepository]
    F -->|Dispatches via Providers| H{Providers}
    H --> I[Firebase Push]
    H --> J[Browser WebSocket]
    H --> K[Voice Alert]
    H --> L[Dashboard]
```

1. Any module emits a domain event (e.g. `DETECTION_CREATED`).
2. `notification.events.ts` catches it and creates a `Notification` entity in DB via `NotificationService`.
3. `NotificationService` emits a `NOTIFICATION_CREATED` event.
4. `NotificationDispatcher` listens to `NOTIFICATION_CREATED`.
5. `NotificationDispatcher` fetches user preferences from `SettingsRepository`.
6. If enabled, it resolves device tokens and pushes to `FirebaseNotificationProvider`.

Every module strictly follows:
`index.ts, routes.ts, controller.ts, service.ts, repository.ts, validator.ts, types.ts`

## Layers & Dependency Injection
1. **Controller**: Handles HTTP request parsing, validates via Zod, forwards payloads to Services, and formats responses via `ApiResponse`.
2. **Service**: Contains pure business logic. Receives repositories via Constructor Injection. Never touches `req` or `res`. Extends `BaseService`.
3. **Repository**: Handles SQL query construction and interacts directly with PostgreSQL. Exposes only business-oriented methods (`findUserByEmail()`).

## AI Integration
AI is abstracted via `IDetectionProvider`. Both `DummyDetectionProvider` and `FastApiDetectionProvider` return the exact same `RawDetectionResult` contract. Controllers/Services must never know which implementation is active.

### FastAPI Contract
The Node.js backend expects the external FastAPI inference server to strictly return the following JSON schema:
```json
{
  "detected": true, 
  "animal": "wild boar",
  "confidence": 92.5,
  "bbox": {
    "x": 100,
    "y": 50,
    "width": 200,
    "height": 150
  }
}
```
If no detection occurs, it may return `{"detected": false}`.
The backend maps these fields into domain models, scales confidence to `0-1`, resolves enums via an `animalMap`, and guarantees bounded coordinates.

## Domain Events
A centralized `DomainEvents` emitter handles decoupling cross-module workflows (e.g. `DETECTION_CREATED` triggers `ALERT_TRIGGERED`).
