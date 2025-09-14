# Reddit JSON Viewer

A modern, responsive web application for discovering and browsing subreddits using Reddit's public JSON API. Log in with your Reddit account to personalize your experience, or explore publicly available content as a guest. This tool allows users to search all of Reddit, find new communities, view posts with embedded media, see sorted comments, and download the raw JSON data for any post.

## Features

### Core Exploration
- **Browse Subreddits**: Enter any public subreddit name to view its posts.
- **Global Reddit Search**: Search for posts across all of Reddit, not just one subreddit.
- **Subreddit Discovery**: Search for new subreddits by keyword and see their descriptions and subscriber counts.
- **Trending & Discovery Hub**: A homepage dashboard featuring trending subreddits and popular topics to kickstart exploration.
- **Advanced Sorting & Filtering**: Sort posts by "Hot", "New", "Top", "Rising", or "Relevance". Customize the number of posts loaded per page.
- **In-Subreddit Search**: Perform targeted searches within the current subreddit.

### Authentication & Personalization
- **Secure OAuth2 Login**: Connect your Reddit account to unlock personalized features. The app uses a client-side OAuth2 flow to ensure your credentials are secure.
- **User Profile Display**: When logged in, view your username, avatar, and total karma directly in the app header.
- **Authenticated API Access**: Access your subscribed subreddits (if private) and enjoy a more personalized browsing experience with higher API rate limits.

### Interactive UI/UX
- **Interactive Posts**: Expand posts to view self-text, embedded images, and videos directly.
- **Sortable Comments**: View the top comments for any post and sort them by "Top", "New", or "Old".
- **Floating "Close Post" Button**: When a post is expanded, a convenient floating button appears, allowing you to close the post and scroll back to its position with a single click.
- **User Avatars**: See profile pictures for post authors and commenters for easier identification.
- **Download Post JSON**: Download the complete, raw JSON data for any individual post with a single click.
- **Responsive Design**: A clean, mobile-friendly interface built with Tailwind CSS.
- **Robust Error Handling**: Provides clear feedback for common issues like private subreddits or network errors.


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and a package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.

### Configuration: Reddit API Key

**This step is required to enable user login.**

1.  **Create a Reddit App**: Go to your Reddit [apps preferences page](https://www.reddit.com/prefs/apps).
2.  Click **"are you a developer? create an app..."** at the bottom.
3.  Fill out the form:
    -   **Name**: Give your app a name (e.g., "My Reddit Viewer").
    -   **Type**: Select **"installed app"**.
    -   **Redirect URI**: Set this to the URL where you will run the app. For local development, this is typically `http://localhost:3000/`.
4.  Click **"create app"**.
5.  **Get the Client ID**: Your client ID will be displayed under the app name you just created. It's a short string of letters and numbers.
6.  **Update the Config File**: Open the `config.ts` file in the project and replace the placeholder `'YOUR_REDDIT_CLIENT_ID'` with your actual client ID.

    ```typescript
    // in config.ts
    export const CLIENT_ID = 'AbcDefGhiJklMn123'; // <-- PASTE YOUR ID HERE
    ```

### Installation & Setup

**Step 1: Clone the repository**

If you have access to the source, clone it to your local machine.

```bash
git clone <repository-url>
cd <repository-directory>
```

**Step 2: Install dependencies**

Install the required npm packages.

```bash
npm install
```

**Step 3: Run the Application**

Start the development server.

```bash
npm run dev
```

Now, open your web browser and navigate to the local server URL (e.g., [http://localhost:3000](http://localhost:3000)). You should see the Reddit Viewer application running.

## How to Use

1.  **(Optional) Login**: Click the "Login" button in the header to authenticate with your Reddit account for a personalized experience.
2.  **Start Exploring**: Use the main input bar to start. You have three options:
    -   **Get Posts**: Enter a subreddit name (e.g., `reactjs`) and click "Get Posts" to browse that community.
    -   **Search Subs**: Enter a keyword (e.g., `hiking`) and click "Search Subs" to find related subreddits.
    -   **Search All**: Enter a search query and click "Search All" to find posts across all of Reddit.
3.  **Discover on the Homepage**: If you're not sure where to start, click a subreddit from the "Trending & Discovery" section on the welcome screen.
4.  **Refine Your View**: Once viewing posts, use the controls to sort them, change the number of posts per page, or search within the current context.
5.  **Interact with Posts**: Click on a post's title to expand it. This will reveal its content (text, images, videos) and load the comments section.
6.  **Close Expanded Post**: Use the floating close button in the bottom-right corner to collapse the post and return to the list.
7.  **Sort Comments**: Within an expanded post, you can sort the comments by "Top", "New", or "Old".
8.  **Download JSON**: Click the "JSON" button with the download icon on any post to save its raw data as a `.json` file.


## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Reddit JSON API](https://www.reddit.com/dev/api/)
- [OAuth 2.0](https://github.com/reddit-archive/reddit/wiki/OAuth2) for authentication
