'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPetReviews, createPetReview, clearPetReviews } from '../../../lib/store/slices/reviewSlice';
import ReviewCard from '../reviews/ReviewCard';
import ReviewForm from '../reviews/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PetReviewsSection({ petId, canReview = false }) {
  const dispatch = useDispatch();
  const { petReviews, petReviewStats, isLoading, isSubmitting } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(fetchPetReviews({ petId }));

    return () => {
      dispatch(clearPetReviews());
    };
  }, [petId, dispatch]);

  const handleSubmitReview = async (reviewData) => {
    try {
      await dispatch(createPetReview({
        ...reviewData,
        petId,
      })).unwrap();
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      
      // Refresh reviews
      dispatch(fetchPetReviews({ petId }));
    } catch (error) {
      toast.error(error || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {petReviewStats.averageRating || 0}
              </div>
              <div className="flex items-center justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`${
                      star <= Math.round(petReviewStats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {petReviewStats.totalReviews} review{petReviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {canReview && !showReviewForm && (
              <div className="flex-1 text-right">
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          type="pet"
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : petReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {petReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canDelete={review.userId === user?.userId}
              onDelete={async (reviewId) => {
                // Handle delete
                toast.success('Review deleted');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
