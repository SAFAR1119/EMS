'use client';
import { useState } from 'react';
interface StarRatingProps { value: number; onChange?: (v: number) => void; readonly?: boolean; }
export default function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={"text-2xl transition-transform " + (!readonly ? 'hover:scale-110 cursor-pointer ' : 'cursor-default ') + (n <= (hover || value) ? 'text-yellow-400' : 'text-gray-300')}>★</button>
      ))}
    </div>
  );
}