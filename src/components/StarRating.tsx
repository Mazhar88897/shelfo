import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (index: number, isHalf: boolean) => {
    if (interactive && onRatingChange) {
      const newRating = index + (isHalf ? 0.5 : 1);
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFull = rating >= starValue;
        const isHalf = rating >= index + 0.5 && rating < starValue;
        
        return (
          <div
            key={index}
            className={cn(
              "relative",
              interactive && "cursor-pointer"
            )}
          >
            {interactive ? (
              <>
                <button
                  type="button"
                  onClick={() => handleClick(index, true)}
                  disabled={!interactive}
                  className={cn(
                    "absolute left-0 top-0 w-1/2 h-full z-10",
                    "transition-opacity hover:opacity-50"
                  )}
                  aria-label={`Rate ${index + 0.5} stars`}
                />
                <button
                  type="button"
                  onClick={() => handleClick(index, false)}
                  disabled={!interactive}
                  className={cn(
                    "absolute right-0 top-0 w-1/2 h-full z-10",
                    "transition-opacity hover:opacity-50"
                  )}
                  aria-label={`Rate ${starValue} stars`}
                />
              </>
            ) : null}
            <div className="relative">
              {/* Background star (always empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-transparent text-muted-foreground/40"
                )}
              />
              {/* Foreground star (filled or half-filled) */}
              <div
                className={cn(
                  "absolute top-0 left-0 overflow-hidden",
                  isHalf ? "w-1/2" : isFull ? "w-full" : "w-0"
                )}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-accent text-accent"
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
