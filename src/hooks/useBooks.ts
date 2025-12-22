import { useState, useEffect, useCallback } from "react";
import {
  Book,
  BookWithDetails,
  Author,
  Category,
  Collection,
  ReadingStatus,
  Review,
} from "@/types";
import {
  initializeStorage,
  getBooks,
  saveBook,
  deleteBook as deleteBookFromStorage,
  getAuthors,
  findOrCreateAuthor,
  getCategories,
  saveCategory,
  getCollections,
  saveCollection,
  deleteCollection as deleteCollectionFromStorage,
  getReadingStatuses,
  getReviews,
  saveReview,
  getReviewByBookId,
} from "@/lib/storage";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readingStatuses, setReadingStatuses] = useState<ReadingStatus[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(() => {
    setBooks(getBooks());
    setAuthors(getAuthors());
    setCategories(getCategories());
    setCollections(getCollections());
    setReadingStatuses(getReadingStatuses());
    setReviews(getReviews());
  }, []);

  useEffect(() => {
    initializeStorage();
    refreshData();
    setIsLoading(false);
  }, [refreshData]);

  const addBook = useCallback(
    (bookData: Omit<Book, "book_id" | "author_id"> & { authorFirstName: string; authorLastName: string }) => {
      const author = findOrCreateAuthor(bookData.authorFirstName, bookData.authorLastName);
      const newBook: Book = {
        book_id: `book-${Date.now()}`,
        title: bookData.title,
        author_id: author.author_id,
        category_id: bookData.category_id,
        reading_status_id: bookData.reading_status_id,
        publisher: bookData.publisher,
        isbn: bookData.isbn,
        pages: bookData.pages,
        bookcover: bookData.bookcover,
        collection_ids: bookData.collection_ids || [],
      };
      saveBook(newBook);
      refreshData();
      return newBook;
    },
    [refreshData]
  );

  const updateBook = useCallback(
    (book: Book) => {
      saveBook(book);
      refreshData();
    },
    [refreshData]
  );

  const removeBook = useCallback(
    (bookId: string) => {
      deleteBookFromStorage(bookId);
      refreshData();
    },
    [refreshData]
  );

  const addCategory = useCallback(
    (name: string) => {
      const newCategory: Category = {
        category_id: `category-${Date.now()}`,
        name,
      };
      saveCategory(newCategory);
      refreshData();
      return newCategory;
    },
    [refreshData]
  );

  const addCollection = useCallback(
    (name: string) => {
      const newCollection: Collection = {
        collection_id: `collection-${Date.now()}`,
        name,
      };
      saveCollection(newCollection);
      refreshData();
      return newCollection;
    },
    [refreshData]
  );

  const removeCollection = useCallback(
    (collectionId: string) => {
      deleteCollectionFromStorage(collectionId);
      refreshData();
    },
    [refreshData]
  );

  const addOrUpdateReview = useCallback(
    (bookId: string, rating: number, comment: string) => {
      const existingReview = getReviewByBookId(bookId);
      const review: Review = {
        review_id: existingReview?.review_id || `review-${Date.now()}`,
        book_id: bookId,
        rating,
        comment,
      };
      saveReview(review);
      refreshData();
      return review;
    },
    [refreshData]
  );

  const getBookWithDetails = useCallback(
    (bookId: string): BookWithDetails | null => {
      const book = books.find((b) => b.book_id === bookId);
      if (!book) return null;

      const author = authors.find((a) => a.author_id === book.author_id) || {
        author_id: "",
        first_name: "Unknown",
        last_name: "Author",
      };
      const category = categories.find((c) => c.category_id === book.category_id) || {
        category_id: "",
        name: "Uncategorized",
      };
      const readingStatus = readingStatuses.find((r) => r.reading_status_id === book.reading_status_id) || {
        reading_status_id: "",
        status: "Not started" as const,
      };
      const review = reviews.find((r) => r.book_id === book.book_id);
      const bookCollections = collections.filter((c) => book.collection_ids?.includes(c.collection_id));

      return {
        ...book,
        author,
        category,
        readingStatus,
        review,
        collections: bookCollections,
      };
    },
    [books, authors, categories, readingStatuses, reviews, collections]
  );

  const getAllBooksWithDetails = useCallback((): BookWithDetails[] => {
    return books.map((book) => getBookWithDetails(book.book_id)!).filter(Boolean);
  }, [books, getBookWithDetails]);

  const getStats = useCallback(() => {
    const allBooks = getAllBooksWithDetails();
    const finishedBooks = allBooks.filter((b) => b.readingStatus.status === "Finished");
    const readingBooks = allBooks.filter((b) => b.readingStatus.status === "Reading");
    const totalPages = finishedBooks.reduce((sum, b) => sum + b.pages, 0);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      totalBooks: allBooks.length,
      finishedBooks: finishedBooks.length,
      currentlyReading: readingBooks.length,
      totalPagesRead: totalPages,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewsCount: reviews.length,
    };
  }, [getAllBooksWithDetails, reviews]);

  return {
    books,
    authors,
    categories,
    collections,
    readingStatuses,
    reviews,
    isLoading,
    addBook,
    updateBook,
    removeBook,
    addCategory,
    addCollection,
    removeCollection,
    addOrUpdateReview,
    getBookWithDetails,
    getAllBooksWithDetails,
    getStats,
    refreshData,
  };
}
