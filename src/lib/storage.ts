import { Book, Author, Category, Collection, ReadingStatus, Review } from "@/types";

const STORAGE_KEYS = {
  books: "shelfio_books",
  authors: "shelfio_authors",
  categories: "shelfio_categories",
  collections: "shelfio_collections",
  readingStatuses: "shelfio_reading_statuses",
  reviews: "shelfio_reviews",
};

// Default reading statuses
const defaultReadingStatuses: ReadingStatus[] = [
  { reading_status_id: "not-started", status: "Not started" },
  { reading_status_id: "reading", status: "Reading" },
  { reading_status_id: "finished", status: "Finished" },
];

// Default categories
const defaultCategories: Category[] = [
  { category_id: "crime", name: "Crime" },
  { category_id: "fantasy", name: "Fantasy" },
  { category_id: "biography", name: "Biography" },
  { category_id: "romance", name: "Romance" },
  { category_id: "science-fiction", name: "Science Fiction" },
  { category_id: "history", name: "History" },
  { category_id: "self-help", name: "Self-Help" },
  { category_id: "other", name: "Other" },
];

// Default collections
const defaultCollections: Collection[] = [
  { collection_id: "favorites", name: "Favorites" },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

// Initialize storage with defaults if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.readingStatuses)) {
    saveToStorage(STORAGE_KEYS.readingStatuses, defaultReadingStatuses);
  }
  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    saveToStorage(STORAGE_KEYS.categories, defaultCategories);
  }
  if (!localStorage.getItem(STORAGE_KEYS.collections)) {
    saveToStorage(STORAGE_KEYS.collections, defaultCollections);
  }
  if (!localStorage.getItem(STORAGE_KEYS.books)) {
    saveToStorage(STORAGE_KEYS.books, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.authors)) {
    saveToStorage(STORAGE_KEYS.authors, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
    saveToStorage(STORAGE_KEYS.reviews, []);
  }
}

// Books
export function getBooks(): Book[] {
  return getFromStorage<Book[]>(STORAGE_KEYS.books, []);
}

export function saveBook(book: Book): void {
  const books = getBooks();
  const existingIndex = books.findIndex((b) => b.book_id === book.book_id);
  if (existingIndex >= 0) {
    books[existingIndex] = book;
  } else {
    books.push(book);
  }
  saveToStorage(STORAGE_KEYS.books, books);
}

export function deleteBook(bookId: string): void {
  const books = getBooks().filter((b) => b.book_id !== bookId);
  saveToStorage(STORAGE_KEYS.books, books);
  // Also delete associated review
  const reviews = getReviews().filter((r) => r.book_id !== bookId);
  saveToStorage(STORAGE_KEYS.reviews, reviews);
}

// Authors
export function getAuthors(): Author[] {
  return getFromStorage<Author[]>(STORAGE_KEYS.authors, []);
}

export function saveAuthor(author: Author): Author {
  const authors = getAuthors();
  const existingIndex = authors.findIndex((a) => a.author_id === author.author_id);
  if (existingIndex >= 0) {
    authors[existingIndex] = author;
  } else {
    authors.push(author);
  }
  saveToStorage(STORAGE_KEYS.authors, authors);
  return author;
}

export function findOrCreateAuthor(firstName: string, lastName: string): Author {
  const authors = getAuthors();
  const existing = authors.find(
    (a) => a.first_name.toLowerCase() === firstName.toLowerCase() && 
           a.last_name.toLowerCase() === lastName.toLowerCase()
  );
  if (existing) return existing;
  
  const newAuthor: Author = {
    author_id: `author-${Date.now()}`,
    first_name: firstName,
    last_name: lastName,
  };
  return saveAuthor(newAuthor);
}

// Categories
export function getCategories(): Category[] {
  return getFromStorage<Category[]>(STORAGE_KEYS.categories, defaultCategories);
}

export function saveCategory(category: Category): void {
  const categories = getCategories();
  const existingIndex = categories.findIndex((c) => c.category_id === category.category_id);
  if (existingIndex >= 0) {
    categories[existingIndex] = category;
  } else {
    categories.push(category);
  }
  saveToStorage(STORAGE_KEYS.categories, categories);
}

// Collections
export function getCollections(): Collection[] {
  return getFromStorage<Collection[]>(STORAGE_KEYS.collections, defaultCollections);
}

export function saveCollection(collection: Collection): void {
  const collections = getCollections();
  const existingIndex = collections.findIndex((c) => c.collection_id === collection.collection_id);
  if (existingIndex >= 0) {
    collections[existingIndex] = collection;
  } else {
    collections.push(collection);
  }
  saveToStorage(STORAGE_KEYS.collections, collections);
}

export function deleteCollection(collectionId: string): void {
  const collections = getCollections().filter((c) => c.collection_id !== collectionId);
  saveToStorage(STORAGE_KEYS.collections, collections);
  // Remove collection from all books
  const books = getBooks().map((book) => ({
    ...book,
    collection_ids: book.collection_ids?.filter((id) => id !== collectionId) || [],
  }));
  saveToStorage(STORAGE_KEYS.books, books);
}

// Reading Statuses
export function getReadingStatuses(): ReadingStatus[] {
  return getFromStorage<ReadingStatus[]>(STORAGE_KEYS.readingStatuses, defaultReadingStatuses);
}

// Reviews
export function getReviews(): Review[] {
  return getFromStorage<Review[]>(STORAGE_KEYS.reviews, []);
}

export function saveReview(review: Review): void {
  const reviews = getReviews();
  const existingIndex = reviews.findIndex((r) => r.review_id === review.review_id);
  if (existingIndex >= 0) {
    reviews[existingIndex] = review;
  } else {
    reviews.push(review);
  }
  saveToStorage(STORAGE_KEYS.reviews, reviews);
}

export function getReviewByBookId(bookId: string): Review | undefined {
  return getReviews().find((r) => r.book_id === bookId);
}

export function deleteReview(reviewId: string): void {
  const reviews = getReviews().filter((r) => r.review_id !== reviewId);
  saveToStorage(STORAGE_KEYS.reviews, reviews);
}
