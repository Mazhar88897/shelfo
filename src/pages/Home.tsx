import { useState, useEffect } from "react";
import { BookWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, BookMarked, BookOpen, CheckCircle2, Library } from "lucide-react";

interface HomeProps {
  books: BookWithDetails[];
  stats: {
    totalBooks: number;
    finishedBooks: number;
    currentlyReading: number;
    totalPagesRead: number;
    averageRating: number;
    reviewsCount: number;
  };
  onNavigateToLibrary: () => void;
  onNavigateToCollections: () => void;
  onAddBook: () => void;
  onBookClick: (book: BookWithDetails) => void;
}

interface LatestBookResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    author: string;
    category: string;
    isbn: string;
    status: string;
    pages: number;
    publisher: string;
    coverUrl: string;
  } | null;
  timestamp: string;
}

interface RecentBooksResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    author: string;
    category: string;
    isbn: string;
    status: string;
    pages: number;
    publisher: string;
    coverUrl: string;
  }[];
}

interface BooksCountResponse {
  success: boolean;
  message: string;
  data: number;
  timestamp: string;
}

interface PagesReadResponse {
  success: boolean;
  data: {
    manualPagesRead: number;
    finishedBooksPagesRead: number;
    totalPagesRead: number;
  };
  timestamp: string;
}

const Home = ({ books, stats, onNavigateToLibrary, onNavigateToCollections, onAddBook, onBookClick }: HomeProps) => {
  const [latestBook, setLatestBook] = useState<LatestBookResponse["data"]>(null);
  const [recentBooks, setRecentBooks] = useState<RecentBooksResponse["data"]>([]);
  const [totalBooksCount, setTotalBooksCount] = useState<number | null>(null);
  const [totalPagesRead, setTotalPagesRead] = useState<number | null>(null); 
  
  useEffect(() => {
    const fetchLatestBook = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "";
        const apiUrl = baseURL ? `${baseURL}/api/books/latest` : "/api/books/latest";
        const response = await fetch(apiUrl);
        if (response.ok) {
          const result: LatestBookResponse = await response.json();
          if (result.data) {
            setLatestBook(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching latest book:", error);
      }
    };
    
    const fetchRecentBooks = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "";
        const apiUrl = baseURL ? `${baseURL}/api/books/recent` : "/api/books/recent";
        const response = await fetch(apiUrl);
        if (response.ok) {
          const result: RecentBooksResponse = await response.json();
          if (result.data && result.data.length > 0) {
            setRecentBooks(result.data.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Error fetching recent books:", error);
      }
    };

    const fetchBooksCount = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "";
        const apiUrl = baseURL ? `${baseURL}/api/books/count` : "/api/books/count";
        const response = await fetch(apiUrl);
        if (response.ok) {
          const result: BooksCountResponse = await response.json();
          if (result.success && result.data !== undefined) {
            setTotalBooksCount(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching books count:", error);
      }
    };

    const fetchPagesRead = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "";
        const apiUrl = baseURL ? `${baseURL}/api/stats/pages-read` : "/api/stats/pages-read";
        const response = await fetch(apiUrl);
        if (response.ok) {
          const result: PagesReadResponse = await response.json();
          if (result.success && result.data) {
            setTotalPagesRead(result.data.totalPagesRead);
          }
        }
      } catch (error) {
        console.error("Error fetching pages read:", error);
      }
    };
    
    fetchLatestBook();
    fetchRecentBooks();
    fetchBooksCount();
    fetchPagesRead();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-semibold">Home</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onNavigateToLibrary}>
                <Library className="w-4 h-4 mr-2" />
                Library
              </Button>
              <Button variant="outline" onClick={onNavigateToCollections}>
                <BookMarked className="w-4 h-4 mr-2" />
                Collection
              </Button> 
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Currently Reading & Recently Added */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currently Reading */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-heading font-semibold mb-4">Currently Reading</h2>
            {latestBook ? (
              <div className="space-y-3">
                <Card className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex gap-3">
                    {latestBook.coverUrl ? (
                      <img 
                        src={latestBook.coverUrl} 
                        alt={latestBook.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                        <Book className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{latestBook.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {latestBook.author}
                      </p>
                      <div className="mt-2">
                       Total Pages: {latestBook.pages}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No books currently being read</p>
              </Card>
            )}
          </section>

          {/* Recently Added */}
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-heading font-semibold mb-4">Recently Added</h2>
            {recentBooks.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {recentBooks.map(book => (
                  <div 
                    key={book.id} 
                    className="cursor-pointer group"
                  >
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-24 h-36 mx-auto object-cover rounded-lg book-card-shadow group-hover:book-card-shadow-hover transition-all mb-2"
                      />
                    ) : (
                      <div className="w-24 h-36 mx-auto bg-muted rounded-lg flex items-center justify-center mb-2">
                        <Book className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-medium text-sm truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <Library className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No books added yet</p>
              </Card>
            )}
          </section>
        </div>

        {/* Statistics */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-heading font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center">
                <Library className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-heading font-bold">
                  {totalBooksCount !== null ? totalBooksCount : stats.totalBooks}
                </p>
                <p className="text-xs text-muted-foreground">Total Books</p>
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center">
                <BookOpen className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-heading font-bold">
                  {latestBook?.title}
                </p>
                <p className="text-xs text-muted-foreground">Now Reading</p>
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-6 h-6 text-success mb-2" />
                <p className="text-2xl font-heading font-bold">
                  {totalPagesRead !== null ? totalPagesRead.toLocaleString() : stats.totalPagesRead.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Pages Read</p>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
