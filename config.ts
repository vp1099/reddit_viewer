// IMPORTANT: Reddit authentication will not work until you provide your own Client ID.
// 1. Go to: https://www.reddit.com/prefs/apps
// 2. Click "are you a developer? create an app..."
// 3. Fill out the form:
//    - name: Can be anything (e.g., Reddit JSON Viewer)
//    - choose "installed app"
//    - about url: Can be blank
//    - redirect uri: The exact URL where this app is running (e.g., http://localhost:3000)
// 4. Click "create app".
// 5. Your Client ID will be listed right under the application name you chose.
// 6. Copy it and paste it here, replacing the placeholder.

// FIX: Explicitly typed as string to avoid literal type comparison error in App.tsx.
export const REDDIT_CLIENT_ID: string = 'YOUR_REDDIT_CLIENT_ID';