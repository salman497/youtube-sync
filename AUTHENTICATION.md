# YouTube Authentication System

This application uses session-based OAuth2 authentication with YouTube API.

## How it works

1. **Direct Connection**: No authorization codes needed - the user clicks "Connect to YouTube" and gets redirected directly to YouTube's OAuth consent screen.

2. **Session Management**: After successful OAuth, tokens are stored in the server session (not in files), making it more secure and stateless.

3. **Automatic Redirect**: After authorization, users are automatically redirected back to the application.

## Authentication Flow

```
Client -> GET /auth/youtube -> YouTube OAuth -> GET /auth/youtube/callback -> Redirect to frontend
```

## API Endpoints

- `GET /auth/youtube` - Redirects to YouTube OAuth consent screen
- `GET /auth/youtube/callback` - Handles OAuth callback and stores tokens in session
- `GET /auth/status` - Returns `{loggedIn: boolean}` based on session state
- `POST /auth/logout` - Destroys session and logs out user

## Environment Variables

Make sure to set these in your `.env` file:

- `YOUTUBE_CLIENT_ID` - Your YouTube API client ID
- `YOUTUBE_CLIENT_SECRET` - Your YouTube API client secret
- `API_HOST` - Your API host (e.g., http://localhost:3001)
- `WEB_HOST` - Your frontend host (e.g., http://localhost:5173)
- `SESSION_SECRET` - Secret key for session encryption

## Benefits of this approach

- **Simpler UX**: No need to copy/paste authorization codes
- **More Secure**: Tokens stored in encrypted sessions, not files
- **Stateless**: Each request creates a new YouTube service instance with session tokens
- **Session Management**: Built-in logout functionality 