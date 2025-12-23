import { useState, useEffect } from "react";
import { useBooks } from "@/hooks/useBooks";
import { AddBookDialog } from "@/components/AddBookDialog";
import { BookDetailsDialog } from "@/components/BookDetailsDialog";
import { BookWithDetails } from "@/types";
import Welcome from "./Welcome";
import Home from "./Home";
import LibraryPage from "./LibraryPage";
import CollectionPage from "./Collection";

type Page = "welcome" | "home" | "library" | "collection";

const Index = () => {
  const {
    categories,
    collections,
    readingStatuses,
    isLoading,
    addBook,
    updateBook,
    removeBook,
    addOrUpdateReview,
    getBookWithDetails,
    getAllBooksWithDetails,
    getStats,
  } = useBooks();

  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookWithDetails | null>(null);
  const [libraryRefreshTrigger, setLibraryRefreshTrigger] = useState(0);

  const allBooks = getAllBooksWithDetails();
  const stats = getStats();

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem("shelfio-visited");
    if (hasVisited) {
      setCurrentPage("home");
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem("shelfio-visited", "true");
    setCurrentPage("home");
  };

  const handleAddBook = (bookData: Parameters<typeof addBook>[0]) => {
    addBook(bookData);
    // Trigger refresh of LibraryPage API data
    setLibraryRefreshTrigger(prev => prev + 1);
  };

  const handleBookClick = (book: BookWithDetails) => {
    setSelectedBook(book);
  };

  const handleUpdateBook = (book: BookWithDetails) => {
    updateBook(book);
    const updated = getBookWithDetails(book.book_id);
    setSelectedBook(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentPage === "welcome" && (
        <Welcome onGetStarted={handleGetStarted} />
      )}

      {currentPage === "home" && (
        <Home
          books={allBooks}
          stats={stats}
          onNavigateToLibrary={() => setCurrentPage("library")}
          onNavigateToCollections={() => setCurrentPage("collection")}
          onAddBook={() => setIsAddBookOpen(true)}
          onBookClick={handleBookClick}
        />
      )}

      {currentPage === "library" && (
        <LibraryPage
          books={allBooks}
          categories={categories}
          collections={collections}
          readingStatuses={readingStatuses}
          onBack={() => setCurrentPage("home")}
          onAddBook={() => setIsAddBookOpen(true)}
          onBookClick={handleBookClick}
          refreshTrigger={libraryRefreshTrigger}
        />
      )}

      {currentPage === "collection" && (
        <CollectionPage
          onBack={() => setCurrentPage("home")}
        />
      )}

      {/* Dialogs */}
      <AddBookDialog
        open={isAddBookOpen}
        onOpenChange={setIsAddBookOpen}
        categories={categories}
        collections={collections}
        readingStatuses={readingStatuses}
        onAddBook={handleAddBook}
      />

      <BookDetailsDialog
        book={selectedBook}
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
        categories={categories}
        collections={collections}
        readingStatuses={readingStatuses}
        onUpdateBook={handleUpdateBook}
        onDeleteBook={removeBook}
        onUpdateReview={addOrUpdateReview}
      />
    </>
  );
};

export default Index;
