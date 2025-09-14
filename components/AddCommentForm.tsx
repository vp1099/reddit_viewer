import React, { useState } from 'react';
import { postComment } from '../services/redditService';

interface AddCommentFormProps {
  accessToken: string;
  parentId: string; // The "fullname" of the post, e.g., t3_...
  onCommentAdded: (comment: any) => void;
}

export const AddCommentForm: React.FC<AddCommentFormProps> = ({ accessToken, parentId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await postComment({ accessToken, parentId, text: commentText });
      if (result.json.errors.length > 0) {
        throw new Error(result.json.errors.map((e: any[]) => e[1]).join(', '));
      }
      setCommentText('');
      onCommentAdded(result.json.data.things[0]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while posting comment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`comment-input-${parentId}`} className="text-sm font-semibold text-gray-300">
            Add a comment
        </label>
        <textarea
            id={`comment-input-${parentId}`}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full bg-gray-700 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
            rows={3}
            disabled={isSubmitting}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="bg-orange-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    </form>
  );
};
