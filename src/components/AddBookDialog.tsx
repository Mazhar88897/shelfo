import { useState } from "react";
import { searchBooks, mapOpenLibraryToBook } from "@/lib/openLibrary";
import { OpenLibrarySearchResult } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Book, Plus, ArrowLeft } from "lucide-react";
import { Category, Collection, ReadingStatus } from "@/types";
import { cn } from "@/lib/utils";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  collections: Collection[];
  readingStatuses: ReadingStatus[];
  onAddBook: (book: {
    title: string;
    authorFirstName: string;
    authorLastName: string;
    category_id: string;
    reading_status_id: string;
    publisher: string;
    isbn: string;
    pages: number;
    bookcover: string;
    collection_ids?: string[];
  }) => void;
}

type ViewState = "search" | "results" | "form";

export function AddBookDialog({
  open,
  onOpenChange,
  categories,
  collections,
  readingStatuses,
  onAddBook,
}: AddBookDialogProps) {
  const [viewState, setViewState] = useState<ViewState>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OpenLibrarySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    authorFirstName: "",
    authorLastName: "",
    category_id: "",
    reading_status_id: "not-started",
    publisher: "",
    isbn: "",
    pages: 0,
    bookcover: "",
    collection_ids: [] as string[],
  });

  const handleSearch = () => {
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      setHasSearched(true);
      searchBooks(searchQuery)
        .then((results) => {
          setSearchResults(results);
          setViewState("results");
        })
        .finally(() => setIsSearching(false));
    }
  };

  const handleSelectBook = (result: OpenLibrarySearchResult) => {
    const mapped = mapOpenLibraryToBook(result);
    setFormData({
      ...formData,
      title: mapped.title,
      authorFirstName: mapped.authorFirstName,
      authorLastName: mapped.authorLastName,
      publisher: mapped.publisher,
      isbn: mapped.isbn,
      pages: mapped.pages,
      bookcover: mapped.bookcover,
    });
    setViewState("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }

    // Call API to add book
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL ? `${baseURL}/api/books` : "/api/books";
      
      // Map category_id to category name
      const selectedCategory = categories.find(cat => cat.category_id === formData.category_id);
      const categoryName = selectedCategory?.name || "";

      // Map reading_status_id to status string
      const selectedStatus = readingStatuses.find(status => status.reading_status_id === formData.reading_status_id);
      const statusString = selectedStatus?.status || "Not started";

      const requestBody = {
        title: formData.title,
        authorFirstName: formData.authorFirstName,
        authorLastName: formData.authorLastName,
        category: categoryName,
        status: statusString,
        pages: formData.pages || 0,
        isbn: formData.isbn || "",
        publisher: formData.publisher || "",
        coverUrl: formData.bookcover || "",
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error("Failed to add book via API");
        window.location.reload();
        return;
      }
    } catch (error) {
      console.error("Error adding book via API:", error);
      window.location.reload();
      return;
    }

    onAddBook({
      ...formData,
      category_id: formData.category_id || categories[0]?.category_id || "",
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setFormData({
      title: "",
      authorFirstName: "",
      authorLastName: "",
      category_id: "",
      reading_status_id: "not-started",
      publisher: "",
      isbn: "",
      pages: 0,
      bookcover: "",
      collection_ids: [],
    });
    setSearchQuery("");
    setSearchResults([]);
    setViewState("search");
    setHasSearched(false);
    onOpenChange(false);
  };

  const resetManualForm = () => {
    setFormData({
      title: "",
      authorFirstName: "",
      authorLastName: "",
      category_id: "",
      reading_status_id: "not-started",
      publisher: "",
      isbn: "",
      pages: 0,
      bookcover: "",
      collection_ids: [],
    });
    setIsManualAddOpen(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.authorFirstName.trim()) {
      alert("Please enter author first name");
      return;
    }
    if (!formData.authorLastName.trim()) {
      alert("Please enter author last name");
      return;
    }
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }
    if (!formData.reading_status_id) {
      alert("Please select a status");
      return;
    }
    if (!formData.pages || formData.pages <= 0) {
      alert("Please enter a valid number of pages");
      return;
    }
    if (!formData.publisher.trim()) {
      alert("Please enter a publisher");
      return;
    }

    // Always call API with all data including coverUrl
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "";
      const apiUrl = baseURL ? `${baseURL}/api/books` : "/api/books";
      
      // Map category_id to category name
      const selectedCategory = categories.find(cat => cat.category_id === formData.category_id);
      const categoryName = selectedCategory?.name || "";

      // Map reading_status_id to status string
      const selectedStatus = readingStatuses.find(status => status.reading_status_id === formData.reading_status_id);
      const statusString = selectedStatus?.status || "Not started";

      // Always send all data including coverUrl, without ISBN
      const requestBody = {
        title: formData.title,
        authorFirstName: formData.authorFirstName,
        authorLastName: formData.authorLastName,
        category: categoryName,
        status: statusString,
        pages: formData.pages || 0,
        publisher: formData.publisher || "",
        coverUrl: formData.bookcover || "",
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error("Failed to add book via API");
        window.location.reload();
        return;
      }
    } catch (error) {
      console.error("Error adding book via API:", error);
      window.location.reload();
      return;
    }

    onAddBook({
      ...formData,
      category_id: formData.category_id || categories[0]?.category_id || "",
    });

    resetManualForm();
  };

  const handleBack = () => {
    if (viewState === "form") {
      setViewState("results");
    } else if (viewState === "results") {
      setViewState("search");
      setSearchResults([]);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {viewState !== "search" && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <DialogTitle className="font-heading text-xl">
              {viewState === "search" && "Add Book"}
              {viewState === "results" && "Search Results"}
              {viewState === "form" && "Book Details"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Search View */}
        {viewState === "search" && (
          <div className="p-6 space-y-6">
            <div className="text-center py-8">
              <Book className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-heading font-semibold mb-2">Search for a Book</p>
              <p className="text-sm text-muted-foreground">
                Search by title, author, or ISBN
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch} 
                  disabled={searchQuery.length < 3 || isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search Online
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setIsManualAddOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {viewState === "results" && (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.key}
                      onClick={() => handleSelectBook(result)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg text-left",
                        "bg-card border border-border hover:bg-secondary/50 transition-colors"
                      )}
                    >
                      {result.cover_i ? (
                        <img
                          src={`https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg`}
                          alt=""
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                          <Book className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{result.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {result.author_name?.join(", ") || "Unknown Author"}
                        </p>
                        {result.first_publish_year && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.first_publish_year}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setIsManualAddOpen(true);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manually Instead
              </Button>
            </div>
          </div>
        )}

        {/* Form View */}
        {viewState === "form" && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authorFirstName">Author First Name</Label>
                    <Input
                      id="authorFirstName"
                      value={formData.authorFirstName}
                      onChange={(e) => setFormData({ ...formData, authorFirstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorLastName">Author Last Name</Label>
                    <Input
                      id="authorLastName"
                      value={formData.authorLastName}
                      onChange={(e) => setFormData({ ...formData, authorLastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.reading_status_id}
                      onValueChange={(value) => setFormData({ ...formData, reading_status_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {readingStatuses.map((status) => (
                          <SelectItem key={status.reading_status_id} value={status.reading_status_id}>
                            {status.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="0"
                      value={formData.pages || ""}
                      onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bookcover">Cover URL</Label>
                  <Input
                    id="bookcover"
                    value={formData.bookcover}
                    onChange={(e) => setFormData({ ...formData, bookcover: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {formData.bookcover && (
                  <div className="flex justify-center">
                    <img
                      src={formData.bookcover}
                      alt="Book cover preview"
                      className="w-24 h-36 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <Button type="submit" className="w-full">
                Add to Library
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>

    {/* Manual Add Dialog */}
    <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="font-heading text-xl">Add Book Manually</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="manual-title">Title *</Label>
                <Input
                  id="manual-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-authorFirstName">Author First Name *</Label>
                  <Input
                    id="manual-authorFirstName"
                    value={formData.authorFirstName}
                    onChange={(e) => setFormData({ ...formData, authorFirstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="manual-authorLastName">Author Last Name *</Label>
                  <Input
                    id="manual-authorLastName"
                    value={formData.authorLastName}
                    onChange={(e) => setFormData({ ...formData, authorLastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manual-status">Status *</Label>
                  <Select
                    value={formData.reading_status_id}
                    onValueChange={(value) => setFormData({ ...formData, reading_status_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {readingStatuses.map((status) => (
                        <SelectItem key={status.reading_status_id} value={status.reading_status_id}>
                          {status.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-pages">Pages *</Label>
                  <Input
                    id="manual-pages"
                    type="number"
                    min="1"
                    value={formData.pages || ""}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="manual-isbn">ISBN</Label>
                  <Input
                    id="manual-isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="manual-publisher">Publisher *</Label>
                <Input
                  id="manual-publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="manual-bookcover">Cover URL</Label>
                <Input
                  id="manual-bookcover"
                  value={formData.bookcover}
                  onChange={(e) => setFormData({ ...formData, bookcover: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {formData.bookcover && (
                <div className="flex justify-center">
                  <img
                    src={formData.bookcover}
                    alt="Book cover preview"
                    className="w-24 h-36 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex-shrink-0">
            <Button 
              type="submit" 
              className="w-full"
              disabled={
                !formData.title.trim() ||
                !formData.authorFirstName.trim() ||
                !formData.authorLastName.trim() ||
                !formData.category_id ||
                !formData.reading_status_id ||
                !formData.pages ||
                formData.pages <= 0 ||
                !formData.publisher.trim()
              }
            >
              Add to Library
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
