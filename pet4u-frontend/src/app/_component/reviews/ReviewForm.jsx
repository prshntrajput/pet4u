'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm({ 
  type = 'pet', // 'pet' or 'shelter'
  onSubmit, 
  isSubmitting = false 
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  
  // For shelter reviews
  const [communicationRating, setCommunicationRating] = useState(0);
  const [facilityRating, setFacilityRating] = useState(0);
  const [processRating, setProcessRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    const reviewData = {
      rating,
      title: title.trim(),
      comment: comment.trim(),
    };

    if (type === 'shelter') {
      if (communicationRating > 0) reviewData.communicationRating = communicationRating;
      if (facilityRating > 0) reviewData.facilityRating = facilityRating;
      if (processRating > 0) reviewData.processRating = processRating;
    }

    await onSubmit(reviewData);

    // Reset form
    setRating(0);
    setTitle('');
    setComment('');
    setCommunicationRating(0);
    setFacilityRating(0);
    setProcessRating(0);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              size={24}
              className={`transition-colors ${
                star <= (hoverRating || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : 'Select rating'}
        </span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating *"
          />

          {/* Category Ratings (Shelter only) */}
          {type === 'shelter' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
                label="Communication"
              />
              <StarRating
                value={facilityRating}
                onChange={setFacilityRating}
                label="Facility"
              />
              <StarRating
                value={processRating}
                onChange={setProcessRating}
                label="Process"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              maxLength={200}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={5}
              maxLength={2000}
              className={comment.length < 10 && comment.length > 0 ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              {comment.length}/2000 characters (minimum 10)
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.length < 10}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
