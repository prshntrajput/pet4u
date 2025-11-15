'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewCard({ review, onDelete, canDelete = false }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(review.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.user?.profileImage} alt={review.user?.name} />
            <AvatarFallback className="bg-blue-600 text-white">
              {review.user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{review.user?.name}</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating}.0
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>

            {review.title && (
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            )}

            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>

            {/* Category ratings (for shelter reviews) */}
            {(review.communicationRating || review.facilityRating || review.processRating) && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {review.communicationRating && (
                  <div className="text-xs">
                    <span className="text-gray-600">Communication: </span>
                    <span className="font-medium">{review.communicationRating}/5</span>
                  </div>
                )}
                {review.facilityRating && (
                  <div className="text-xs">
                    <span className="text-gray-600">Facility: </span>
                    <span className="font-medium">{review.facilityRating}/5</span>
                  </div>
                )}
                {review.processRating && (
                  <div className="text-xs">
                    <span className="text-gray-600">Process: </span>
                    <span className="font-medium">{review.processRating}/5</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
