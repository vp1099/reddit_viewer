# Reddit JSON Viewer

A modern, responsive web application for discovering and browsing subreddits using Reddit's public JSON API. This tool allows users to search all of Reddit, find new communities, view posts with embedded media, see sorted comments, and download the raw JSON data for any post.

## Features

- **Browse Subreddits**: Enter any public subreddit name to view its posts.
- **Global Reddit Search**: Search for posts across all of Reddit, not just one subreddit.
- **Subreddit Discovery**: Search for new subreddits by keyword and see their descriptions and subscriber counts.
- **Trending & Discovery Hub**: A homepage dashboard featuring trending subreddits and popular topics to kickstart exploration.
- **Advanced Sorting & Filtering**: Sort posts by "Hot", "New", "Top", "Rising", or "Relevance". Customize the number of posts loaded per page.
- **In-Subreddit Search**: Perform targeted searches within the current subreddit.
- **Interactive Posts**: Expand posts to view self-text, embedded images, and videos directly.
- **Sortable Comments**: View the top comments for any post and sort them by "Top", "New", or "Old".
- **User Avatars**: See profile pictures for post authors and commenters.
- **Download Post JSON**: Download the complete, raw JSON data for any individual post with a single click.
- **Responsive Design**: A clean, mobile-friendly interface built with Tailwind CSS.
- **Robust Error Handling**: Provides clear feedback for common issues like private subreddits or network errors.


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and a package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.

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

1.  **Start Exploring**: Use the main input bar to start. You have three options:
    -   **Get Posts**: Enter a subreddit name (e.g., `reactjs`) and click "Get Posts" to browse that community.
    -   **Search Subs**: Enter a keyword (e.g., `hiking`) and click "Search Subs" to find related subreddits.
    -   **Search All**: Enter a search query and click "Search All" to find posts across all of Reddit.
2.  **Discover on the Homepage**: If you're not sure where to start, click a subreddit from the "Trending & Discovery" section on the welcome screen.
3.  **Refine Your View**: Once viewing posts, use the controls to sort them, change the number of posts per page, or search within the current context.
4.  **Interact with Posts**: Click on a post's title to expand it. This will reveal its content (text, images, videos) and load the comments section.
5.  **Sort Comments**: Within an expanded post, you can sort the comments by "Top", "New", or "Old".
6.  **Download JSON**: Click the "JSON" button with the download icon on any post to save its raw data as a `.json` file.


## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Reddit JSON API](https://www.reddit.com/dev/api/)
