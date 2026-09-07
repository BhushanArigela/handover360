import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, size = 'md', showValue = false }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          className={`${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!onRate}
        >
          <Star
            className={`${sizeClass} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        </button>
      ))}
      {showValue && <span className="ml-1 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>}
    </div>
  );
};
