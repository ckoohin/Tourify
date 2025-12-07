import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, size = 16, editable = false, className = "" }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {stars.map((star) => {
        const full = rating >= star;
        const half = rating >= star - 0.5 && rating < star;
        
        return (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && setRating(star)}
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star 
              size={size} 
              className={`
                ${full ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 fill-slate-100'}
                ${half ? 'fill-yellow-400 text-yellow-400' : ''} 
                transition-colors
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;