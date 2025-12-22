export interface Author {
  author_id: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  category_id: string;
  name: string;
}

export interface Collection {
  collection_id: string;
  name: string;
}

export interface ReadingStatus {
  reading_status_id: string;
  status: "Not started" | "Reading" | "Finished";
}

export interface Review {
  review_id: string;
  book_id: string;
  rating: number;
  comment: string;
}

export interface Book {
  book_id: string;
  title: string;
  author_id: string;
  category_id: string;
  reading_status_id: string;
  publisher: string;
  isbn: string;
  pages: number;
  bookcover: string;
  collection_ids?: string[];
}

export interface BookWithDetails extends Book {
  author: Author;
  category: Category;
  readingStatus: ReadingStatus;
  review?: Review;
  collections?: Collection[];
}

// Open Library API types
export interface OpenLibrarySearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibrarySearchResult[];
}
