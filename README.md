# Reddit JSON Viewer

A modern, responsive web application for browsing subreddits using Reddit's public JSON API. This tool allows users to fetch and display posts, view top comments, search within subreddits, and download the raw JSON data for any post.

## Features

- **Browse Any Subreddit**: Enter any public subreddit name to view its posts.
- **Sort Posts**: Sort posts by "Hot", "New", "Top", and "Rising".
- **Search Functionality**: Perform searches within the current subreddit.
- **View Top Comments**: Expand any post to see its top-rated comments.
- **Download Post JSON**: Download the complete, raw JSON data for any individual post with a single click.
- **Responsive Design**: A clean, mobile-friendly interface built with Tailwind CSS.
- **Error Handling**: Provides clear feedback for common issues like private subreddits or network errors.

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

1.  **Enter a Subreddit**: Type the name of a subreddit (e.g., `reactjs`, `pics`) into the main input field and click "Get Posts".
2.  **Sort and Search**: Use the sorting buttons to reorder the posts. Use the search bar that appears to find specific posts within that subreddit.
3.  **View Comments**: Click "View Comments" on any post card to load the top comments.
4.  **Download JSON**: Click the "JSON" button with the download icon on any post to save its raw data as a `.json` file.

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Reddit JSON API](https://www.reddit.com/dev/api/)
