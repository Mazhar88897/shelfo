import { BookWithDetails } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { BookOpen, BookMarked, Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookWithDetails;
  onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const statusIcons = {
    "Not started": Book,
    Reading: BookOpen,
    Finished: BookMarked,
  };

  const statusColors = {
    "Not started": "bg-muted text-muted-foreground",
    Reading: "bg-accent/20 text-accent-foreground",
    Finished: "bg-success/20 text-success",
  };

  const StatusIcon = statusIcons[book.readingStatus.status];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "book-card-shadow hover:book-card-shadow-hover hover:-translate-y-1",
        "bg-card border-border/50"
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <div className="relative flex-shrink-0 w-24 h-36 rounded-md overflow-hidden bg-muted">
          {book.bookcover ? (
            <img
              src={book.bookcover}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Book className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-accent transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {book.author.first_name} {book.author.last_name}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {book.category.name}
            </Badge>
            <Badge className={cn("text-xs", statusColors[book.readingStatus.status])}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {book.readingStatus.status}
            </Badge>
          </div>

          <div className="mt-auto flex items-center justify-between">
            {book.review && (
              <StarRating rating={book.review.rating} size="sm" />
            )}
            {book.pages > 0 && (
              <span className="text-xs text-muted-foreground">
                {book.pages} pages
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
