# Coding Test Interface - Documentation

## Overview
Complete coding test interface with comprehensive anti-cheating features built with Next.js, TypeScript, and Prisma.

## Features

### 1. Timer System
- **Countdown Timer**: Displays time remaining in HH:MM:SS format
- **Auto-Submit**: Automatically submits code when time expires
- **Time Warnings**: 
  - 5-minute warning (yellow alert)
  - 1-minute warning (red alert)
- **Visual Feedback**: Timer turns red when less than 5 minutes remain

### 2. Anti-Cheating Features

#### Copy/Paste Prevention
- Disables copy, paste, and cut operations
- Shows warning messages when attempted
- Logs all attempts to database

#### Tab/Window Switching Detection
- Monitors `blur` events on window
- Tracks `visibilitychange` events
- Logs all tab switches with timestamps

#### Camera Monitoring
- Requests camera permission on page load
- Captures snapshots every 2 minutes
- Converts images to base64 JPEG
- Uploads to server with timestamps
- Stores in `/uploads/snapshots/` directory

### 3. Code Editor
- Simple textarea-based code editor
- Pre-filled with starter code
- Monospace font for code readability
- Auto-resize to fill available space

### 4. User Interface
- **Split Layout**: Problem description on left, code editor on right
- **Responsive Design**: Adapts to different screen sizes
- **Clear Visual Hierarchy**: Prominent timer, warnings, and submit button
- **Warning Messages**: Yellow banner for cheating detection alerts

## API Routes

### GET `/api/test/[sessionId]`
Fetches test session data.

**Response:**
```json
{
  "id": "session_id",
  "title": "Test Title",
  "description": "Problem description",
  "starterCode": "// starter code",
  "duration": 60,
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/test/[sessionId]/submit`
Submits the candidate's code.

**Request:**
```json
{
  "code": "function solution() { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code submitted successfully",
  "submittedAt": "2024-01-01T01:00:00.000Z"
}
```

### POST `/api/test/cheating`
Logs cheating events.

**Request:**
```json
{
  "sessionId": "session_id",
  "type": "copy|paste|cut|tab_switch|window_blur",
  "timestamp": "2024-01-01T00:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "logId": "log_id"
}
```

### POST `/api/test/snapshot`
Uploads camera snapshots.

**Request:**
```json
{
  "sessionId": "session_id",
  "image": "data:image/jpeg;base64,...",
  "timestamp": "2024-01-01T00:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "snapshotId": "snapshot_id",
  "imageUrl": "/uploads/snapshots/filename.jpg"
}
```

## Database Schema

The interface uses the following Prisma models:

- **TestSession**: Main test session data
- **CodingProblem**: Problem details and starter code
- **CheatingLog**: Logs of all cheating attempts
- **CameraSnapshot**: Stored camera snapshots

## Security Considerations

1. **Client-Side**: All anti-cheating measures run in the browser
2. **Server-Side**: All events are logged and timestamped
3. **Camera Snapshots**: Stored server-side for review
4. **Immutable Logs**: Cheating events cannot be deleted by candidates

## Usage

Navigate to `/test/[sessionId]` where `sessionId` is a valid test session ID from the database.

The page will:
1. Request camera permission
2. Load test data
3. Start the timer
4. Monitor for cheating attempts
5. Auto-submit on timeout or manual submission

## File Structure

```
app/
├── test/
│   └── [sessionId]/
│       └── page.tsx              # Main test interface
└── api/
    └── test/
        ├── [sessionId]/
        │   ├── route.ts          # GET test session
        │   └── submit/
        │       └── route.ts      # POST code submission
        ├── cheating/
        │   └── route.ts          # POST cheating logs
        └── snapshot/
            └── route.ts          # POST camera snapshots
```

## Future Enhancements

- Code syntax highlighting
- Real-time code execution
- Multiple test cases with validation
- Face detection in camera snapshots
- Screen recording capabilities
- AI-based code plagiarism detection
