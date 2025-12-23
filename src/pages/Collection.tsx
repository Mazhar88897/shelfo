import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/StarRating";
import { Book, ArrowLeft, Library, BookOpen, BookMarked, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionPageProps {
  onBack: () => void;
}

interface CollectionBook {
  id: number;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: string;
  pages: number;
  pagesRead: number;
  publisher: string;
  coverUrl?: string;
  reviews?: Array<{
    reviewId: number;
    rating: number;
    comment?: string;
    createdAt?: string;
  }>;
}

interface Collection {
  id: number;
  name: string;
  books: CollectionBook[];
}

interface CollectionsResponse {
  success: boolean;
  data: Collection[];
  timestamp: string;
}

const CollectionPage = ({ onBack }: CollectionPageProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL ? `${baseURL}/api/collections` : "/api/collections";
      const response = await fetch(apiUrl);
      if (response.ok) {
        const result: CollectionsResponse = await response.json();
        if (result.success && result.data) {
          setCollections(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL ? `${baseURL}/api/collections` : "/api/collections";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });

      if (response.ok) {
        setNewCollectionName("");
        setIsCreateDialogOpen(false);
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleDeleteCollection = async (collectionId: number) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL 
        ? `${baseURL}/api/collections/${collectionId}`
        : `/api/collections/${collectionId}`;
      
      const response = await fetch(apiUrl, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleDeleteBookFromCollection = async (collectionId: number, bookId: number) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL
        ? `${baseURL}/api/collections/${collectionId}/books/${bookId}`
        : `/api/collections/${collectionId}/books/${bookId}`;
      
      const response = await fetch(apiUrl, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting book from collection:", error);
    }
  };

  const statusIcons = {
    "Not started": Book,
    Reading: BookOpen,
    Finished: BookMarked,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-heading font-semibold">Collections</h1>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Library className="w-16 h-16 text-muted-foreground/50 mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Library className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-heading font-semibold mb-2">
              No collections found
            </h2>
            <p className="text-muted-foreground">
              Collections will appear here once you add books to them
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {collections.map((collection) => {
              const totalBooks = collection.books.length;
              return (
                <AccordionItem
                  key={collection.id}
                  value={`collection-${collection.id}`}
                  className="border border-border rounded-lg bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-heading font-semibold">
                          {collection.name}
                        </h2>
                        <Badge variant="secondary" className="text-xs">
                          {totalBooks} {totalBooks === 1 ? "book" : "books"}
                        </Badge>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCollection(collection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {collection.books.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No books in this collection</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                        {collection.books.map((book) => {
                          const StatusIcon = statusIcons[book.status as keyof typeof statusIcons] || Book;
                          return (
                            <div
                              key={book.id}
                              className={cn(
                                "relative flex gap-4 p-4 rounded-lg bg-card border border-border",
                                "hover:bg-secondary/50 transition-colors"
                              )}
                            >
                              {/* Cover */}
                              {book.coverUrl ? (
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                  <Book className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-semibold truncate">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {book.author}
                                </p>
                                <div className="mt-2">
                                  {book.reviews && book.reviews.length > 0 ? (
                                    <StarRating
                                      rating={book.reviews[book.reviews.length - 1].rating}
                                      size="sm"
                                    />
                                  ) : (
                                    <StarRating rating={0} size="sm" interactive={false} />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    {book.category}
                                  </Badge>
                             
                                 
                                </div>
                              </div>

                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Book from Collection</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{book.title}" from "{collection.name}"? This will not delete the book from your library.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBookFromCollection(collection.id, book.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </main>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="Enter collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCollection();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionPage;

