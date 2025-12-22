import { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer shrink-0"
            onClick={() => onSelectCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.category_id}
              variant={selectedCategory === category.category_id ? "default" : "outline"}
              className="cursor-pointer shrink-0"
              onClick={() => onSelectCategory(category.category_id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
