import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface FeedbackFormProps {
  complaintId: string;
  onSubmit: (rating: number, comments: string) => void;
  onCancel: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ complaintId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comments);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Share your experience..."
          />
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" variant="primary">
            Submit Feedback
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FeedbackForm;
