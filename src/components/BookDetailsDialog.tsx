import { useState } from "react";
import { BookWithDetails, Category, Collection, ReadingStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "./StarRating";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Book,
  BookOpen,
  BookMarked,
  Trash2,
  Edit3,
  Save,
  X,
  Heart,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookDetailsDialogProps {
  book: BookWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  collections: Collection[];
  readingStatuses: ReadingStatus[];
  onUpdateBook: (book: BookWithDetails) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateReview: (bookId: string, rating: number, comment: string) => void;
}

export function BookDetailsDialog({
  book,
  open,
  onOpenChange,
  categories,
  collections,
  readingStatuses,
  onUpdateBook,
  onDeleteBook,
  onUpdateReview,
}: BookDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("review");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedCollections, setEditedCollections] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  if (!book) return null;

  const statusIcons = {
    "Not started": Book,
    Reading: BookOpen,
    Finished: BookMarked,
  };

  const StatusIcon = statusIcons[book.readingStatus.status];

  const handleStartEdit = () => {
    setEditedStatus(book.reading_status_id);
    setEditedCategory(book.category_id);
    setEditedCollections(book.collection_ids || []);
    setRating(book.review?.rating || 0);
    setReviewComment(book.review?.comment || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateBook({
      ...book,
      reading_status_id: editedStatus,
      category_id: editedCategory,
      collection_ids: editedCollections,
    });

    if (rating > 0 || reviewComment.trim()) {
      onUpdateReview(book.book_id, rating, reviewComment);
    }

    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteBook(book.book_id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const toggleCollection = (collectionId: string) => {
    if (editedCollections.includes(collectionId)) {
      setEditedCollections(editedCollections.filter((id) => id !== collectionId));
    } else {
      setEditedCollections([...editedCollections, collectionId]);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setActiveTab("review");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b flex-row items-start justify-between">
            <DialogTitle className="font-heading text-xl pr-4">
              Book Details
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Book Info Header */}
              <div className="flex gap-4">
                {/* Cover */}
                {book.bookcover ? (
                  <img
                    src={book.bookcover}
                    alt={`Cover of ${book.title}`}
                    className="w-24 h-36 object-cover rounded-lg book-card-shadow flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-36 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Book className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-lg line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {book.author.first_name} {book.author.last_name}
                  </p>
                  {book.publisher && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Publisher: {book.publisher}
                    </p>
                  )}
                  {book.pages > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Pages: {book.pages}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="review">Review</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="mt-4 space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label>Your Rating</Label>
                        <div className="mt-2">
                          <StarRating
                            rating={rating}
                            interactive
                            onRatingChange={setRating}
                            size="lg"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review">Your Review</Label>
                        <Textarea
                          id="review"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you think of this book?"
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {book.review ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Rating</p>
                            <StarRating rating={book.review.rating} />
                          </div>
                          {book.review.comment && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Review</p>
                              <p className="text-sm italic">"{book.review.comment}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p className="text-sm">No review yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleStartEdit}
                          >
                            Add Review
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="collections" className="mt-4">
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {collections.map((collection) => (
                        <Badge
                          key={collection.collection_id}
                          variant={editedCollections.includes(collection.collection_id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleCollection(collection.collection_id)}
                        >
                          {collection.collection_id === "favorites" && (
                            <Heart className="w-3 h-3 mr-1" />
                          )}
                          {collection.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {book.collections && book.collections.length > 0 ? (
                        book.collections.map((collection) => (
                          <Badge key={collection.collection_id} variant="secondary">
                            {collection.collection_id === "favorites" && (
                              <Heart className="w-3 h-3 mr-1 fill-current" />
                            )}
                            {collection.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Not in any collections</p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    {isEditing ? (
                      <Select value={editedStatus} onValueChange={setEditedStatus}>
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {readingStatuses.map((status) => (
                            <SelectItem key={status.reading_status_id} value={status.reading_status_id}>
                              {status.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={cn(
                          book.readingStatus.status === "Finished" && "bg-success/20 text-success",
                          book.readingStatus.status === "Reading" && "bg-accent/20 text-accent-foreground",
                          book.readingStatus.status === "Not started" && "bg-muted text-muted-foreground"
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {book.readingStatus.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Book className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    {isEditing ? (
                      <Select value={editedCategory} onValueChange={setEditedCategory}>
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{book.category.name}</Badge>
                    )}
                  </div>
                  {book.pages > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pages Read:</span>
                      <span>
                        {book.readingStatus.status === "Finished" ? book.pages : 0} / {book.pages}
                      </span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer */}
          {isEditing && (
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{book.title}" from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
