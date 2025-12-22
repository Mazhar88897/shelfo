import { useState, useMemo, useEffect, useCallback } from "react";
import { BookWithDetails, Category, Collection, ReadingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { Book, Search, Plus, ArrowLeft, Library, BookOpen, BookMarked, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibraryPageProps {
  books: BookWithDetails[];
  categories: Category[];
  collections: Collection[];
  readingStatuses: ReadingStatus[];
  onBack: () => void;
  onAddBook: () => void;
  onBookClick: (book: BookWithDetails) => void;
  refreshTrigger?: number;
}

type FilterType = "all" | "status" | "category";

interface ApiBook {
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
}

interface BooksResponse {
  success: boolean;
  data: ApiBook[];
  timestamp: string;
}

const LibraryPage = ({
  books,
  categories,
  collections,
  readingStatuses,
  onBack,
  onAddBook,
  onBookClick,
  refreshTrigger = 0,
}: LibraryPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [apiBooks, setApiBooks] = useState<ApiBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<ApiBook | null>(null);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);

  // Extract unique categories from API books
  const apiCategories = useMemo(() => {
    if (apiBooks.length === 0) return [];
    const uniqueCategories = Array.from(new Set(apiBooks.map(book => book.category)));
    return uniqueCategories.sort();
  }, [apiBooks]);

  // Fetch books function
  const fetchBooks = useCallback(async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL ? `${baseURL}/api/books` : "/api/books";
      const response = await fetch(apiUrl);
      if (response.ok) {
        const result: BooksResponse = await response.json();
        if (result.success && result.data) {
          setApiBooks(result.data);
          return result.data;
        }
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    return null;
  }, []);

  // Fetch books on mount and when refreshTrigger changes
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, refreshTrigger]);

  const filteredApiBooks = useMemo(() => {
    if (apiBooks.length === 0) return [];
    
    return apiBooks.filter((book) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      // Active filter type
      if (activeFilter === "status" && selectedStatus) {
        const status = readingStatuses.find(s => s.reading_status_id === selectedStatus);
        return matchesSearch && status && book.status === status.status;
      }
      if (activeFilter === "category" && selectedCategory) {
        return matchesSearch && book.category === selectedCategory;
      }

      return matchesSearch;
    });
  }, [apiBooks, searchQuery, activeFilter, selectedStatus, selectedCategory, readingStatuses]);


  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setSelectedStatus(null);
    setSelectedCategory(null);
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
              <h1 className="text-2xl font-heading font-semibold">Library</h1>
            </div>
            <Button onClick={onAddBook}>
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "status" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("status")}
          >
            Status ▼
          </Button>
          <Button
            variant={activeFilter === "category" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("category")}
          >
            Category ▼
          </Button>
        </div>

        {/* Sub-filters */}
        {activeFilter === "status" && (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {readingStatuses.map((status) => (
                <Badge
                  key={status.reading_status_id}
                  variant={selectedStatus === status.reading_status_id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus(
                    selectedStatus === status.reading_status_id ? null : status.reading_status_id
                  )}
                >
                  {status.status}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        )}

        {activeFilter === "category" && (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {apiBooks.length > 0 ? (
                // Show categories from API books
                apiCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                  >
                    {category}
                  </Badge>
                ))
              ) : null}
            </div>
          </ScrollArea>
        )}

        {/* Books List */}
        {filteredApiBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Library className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-heading font-semibold mb-2">
              {apiBooks.length === 0 ? "Your library is empty" : "No books found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {apiBooks.length === 0
                ? "Add your first book to get started"
                : "Try adjusting your search or filters"}
            </p>
            {apiBooks.length === 0 && (
              <Button onClick={onAddBook}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Book
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApiBooks.map((apiBook) => {
              const StatusIcon = statusIcons[apiBook.status as keyof typeof statusIcons] || Book;
              return (
                <div
                  key={apiBook.id}
                  onClick={() => {
                    setSelectedBook(apiBook);
                    setPagesRead(apiBook.pagesRead || 0);
                    setRating(0); // Reset rating when opening modal
                  }}
                  className={cn(
                    "flex gap-4 p-4 rounded-lg bg-card border border-border",
                    "cursor-pointer hover:bg-secondary/50 transition-colors"
                  )}
                >
                  {/* Cover */}
                  {apiBook.coverUrl ? (
                    <img
                      src={apiBook.coverUrl}
                      alt={apiBook.title}
                      className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold truncate">{apiBook.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {apiBook.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {apiBook.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          apiBook.status === "Finished" && "border-success text-success",
                          apiBook.status === "Reading" && "border-accent text-accent"
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {apiBook.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Book Details Modal */}
      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="font-heading text-xl">Book Details</DialogTitle>
          </DialogHeader>

          {selectedBook && (() => {
            const BookStatusIcon = statusIcons[selectedBook.status as keyof typeof statusIcons] || Book;
            return (
              <>
                <ScrollArea className="h-[calc(90vh-180px)]">
                  <div className="p-6 space-y-6">
                    {/* Book Info Header */}
                    <div className="flex gap-4">
                      {/* Cover */}
                      {selectedBook.coverUrl ? (
                        <img
                          src={selectedBook.coverUrl}
                          alt={`Cover of ${selectedBook.title}`}
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
                          {selectedBook.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {selectedBook.author}
                        </p>
                        {selectedBook.publisher && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Publisher: {selectedBook.publisher}
                          </p>
                        )}
                        {selectedBook.pages > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Pages: {selectedBook.pages}
                          </p>
                        )}
                        {selectedBook.pagesRead !== undefined && selectedBook.pages > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Pages Read: {selectedBook.pagesRead} / {selectedBook.pages}
                          </p>
                        )}
                        {selectedBook.isbn && (
                          <p className="text-sm text-muted-foreground">
                            ISBN: {selectedBook.isbn}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status and Category */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            selectedBook.status === "Finished" && "border-success text-success",
                            selectedBook.status === "Reading" && "border-accent text-accent"
                          )}
                        >
                          <BookStatusIcon className="w-3 h-3 mr-1" />
                          {selectedBook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Category:</span>
                        <Badge variant="secondary" className="text-xs">
                          {selectedBook.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Pages Read Input */}
                    <div className="space-y-2">
                      <Label htmlFor="pages-read">Pages Read</Label>
                      <Input
                        id="pages-read"
                        type="number"
                        min="0"
                        max={selectedBook.pages}
                        value={pagesRead}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value <= selectedBook.pages) {
                            setPagesRead(value);
                          }
                        }}
                        placeholder="Enter pages read"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum: {selectedBook.pages} pages
                      </p>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <StarRating
                        rating={rating}
                        interactive
                        onRatingChange={setRating}
                        size="lg"
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Save Button */}
                <div className="p-4 border-t flex-shrink-0">
                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!selectedBook) return;

                      try {
                        const baseURL = import.meta.env.VITE_API_BASE_URL || "";
                        
                        // Update pages read
                        if (pagesRead !== (selectedBook.pagesRead || 0)) {
                          const pagesReadUrl = baseURL 
                            ? `${baseURL}/api/books/${selectedBook.id}/pages-read`
                            : `/api/books/${selectedBook.id}/pages-read`;
                          
                          await fetch(pagesReadUrl, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ pagesRead }),
                          });
                        }

                        // Update review if rating is provided
                        if (rating > 0) {
                          const reviewUrl = baseURL
                            ? `${baseURL}/api/books/${selectedBook.id}/review`
                            : `/api/books/${selectedBook.id}/review`;
                          
                          await fetch(reviewUrl, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              rating,
                              comment: "",
                            }),
                          });
                        }

                        // Refresh books list
                        const updatedBooks = await fetchBooks();
                        
                        // Update selected book if it still exists
                        if (updatedBooks) {
                          const updatedBook = updatedBooks.find(b => b.id === selectedBook.id);
                          if (updatedBook) {
                            setSelectedBook(updatedBook);
                            setPagesRead(updatedBook.pagesRead || 0);
                          }
                        }
                        
                        // Close the modal after successful save
                        setSelectedBook(null);
                      } catch (error) {
                        console.error("Error saving book data:", error);
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryPage;
