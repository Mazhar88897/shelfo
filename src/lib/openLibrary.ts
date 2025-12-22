import { OpenLibrarySearchResponse, OpenLibrarySearchResult } from "@/types";

const OPEN_LIBRARY_API = "https://openlibrary.org";

export async function searchBooks(query: string): Promise<OpenLibrarySearchResult[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,publisher,isbn,number_of_pages_median,cover_i`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch from Open Library");
    }
    
    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs;
  } catch (error) {
    console.error("Error searching Open Library:", error);
    return [];
  }
}

export function getCoverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M"): string {
  if (!coverId) {
    return "";
  }
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Adapter function to map Open Library data to our internal Book structure
export function mapOpenLibraryToBook(
  result: OpenLibrarySearchResult
): {
  title: string;
  authorFirstName: string;
  authorLastName: string;
  publisher: string;
  isbn: string;
  pages: number;
  bookcover: string;
} {
  const authorName = result.author_name?.[0] || "Unknown Author";
  const nameParts = authorName.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || authorName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  return {
    title: result.title,
    authorFirstName: firstName,
    authorLastName: lastName,
    publisher: result.publisher?.[0] || "",
    isbn: result.isbn?.[0] || "",
    pages: result.number_of_pages_median || 0,
    bookcover: getCoverUrl(result.cover_i, "L"),
  };
}
