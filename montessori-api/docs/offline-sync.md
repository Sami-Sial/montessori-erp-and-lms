# Offline Sync — API Reference

## Strategy

| Field type | Resolution |
|---|---|
| Simple fields (attendance status, mastery level) | **Last-write-wins** — server applies client value |
| Ambiguous (same record edited on two devices simultaneously) | **CONFLICT** — logged to `SyncLog`, surfaced in UI for manual resolution |

Conflicts are **never silently overwritten**. A teacher must explicitly choose server, client, or a custom merged value.

## Endpoints

### POST /api/v1/sync/push

Push a batch of offline-queued writes on reconnect.

**Request:**
```json
{
  "items": [
    {
      "clientId": "local-uuid-123",
      "deviceId": "tablet-sunflower-01",
      "entity": "AttendanceRecord",
      "entityId": null,
      "operation": "CREATE",
      "payload": { "studentId": "...", "classroomId": "...", "date": "2024-11-01", "checkType": "CHECK_IN", "status": "PRESENT" },
      "clientVersion": 1,
      "clientTs": "2024-11-01T08:12:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "processed": 1,
  "synced": 1,
  "conflicts": 0,
  "failed": 0,
  "results": [
    { "clientId": "local-uuid-123", "status": "SYNCED", "entityId": "server-uuid-456" }
  ]
}
```

Status values: `SYNCED` | `CONFLICT` | `FAILED`

### GET /api/v1/sync/pull?since=<ISO8601>&classroomId=<uuid>

Pull server-side changes since a timestamp. Used on reconnect to refresh IndexedDB.

**Response:**
```json
{
  "syncedAt": "2024-11-01T14:00:00Z",
  "since": "2024-11-01T08:00:00Z",
  "delta": {
    "attendance": [...],
    "observations": [...],
    "lessonPlans": [...],
    "roster": [{ "id": "...", "firstName": "Alex", "lastName": "Johnson", "qrCode": "QR-STU-001-..." }]
  }
}
```

### GET /api/v1/sync/conflicts

Returns all unresolved sync conflicts (`SyncLog` where `resolution = MANUAL` and `resolvedAt = null`).

### PATCH /api/v1/sync/conflicts/:id/resolve

Resolve a conflict manually.

**Request:**
```json
{
  "resolution": "SERVER_WINS",
  "resolvedPayload": null
}
```

`resolution`: `SERVER_WINS` | `CLIENT_WINS` | `MANUAL` (requires `resolvedPayload`)

## Supported Entities

| Entity | CREATE | UPDATE | DELETE |
|---|---|---|---|
| AttendanceRecord | ✅ | ✅ (conflict-detected) | ❌ |
| Observation | ✅ | ✅ (conflict-detected) | ❌ |
| StudentProgress | ✅ | ✅ (last-write-wins) | ❌ |
| LessonPlan | ✅ | ✅ (last-write-wins) | ❌ |

## SyncQueue Schema

Every pushed item is recorded in `SyncQueue` before processing:
- `deviceId` — identifies the originating device
- `status` — PENDING → SYNCED | CONFLICT | FAILED
- `clientVersion` — monotonic counter incremented on each device edit
- `payload` — the full record payload from the client
