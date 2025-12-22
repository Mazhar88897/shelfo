import { useState } from "react";
import { Collection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X, Heart, Folder } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CollectionManagerProps {
  collections: Collection[];
  selectedCollection: string | null;
  onSelectCollection: (collectionId: string | null) => void;
  onAddCollection: (name: string) => void;
  onDeleteCollection: (collectionId: string) => void;
}

export function CollectionManager({
  collections,
  selectedCollection,
  onSelectCollection,
  onAddCollection,
  onDeleteCollection,
}: CollectionManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim());
      setNewCollectionName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Collections</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCollection} className="flex gap-2">
              <Input
                placeholder="Collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                autoFocus
              />
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Badge
            variant={selectedCollection === null ? "default" : "outline"}
            className="cursor-pointer shrink-0"
            onClick={() => onSelectCollection(null)}
          >
            All Books
          </Badge>
          {collections.map((collection) => (
            <Badge
              key={collection.collection_id}
              variant={selectedCollection === collection.collection_id ? "default" : "outline"}
              className={cn(
                "cursor-pointer shrink-0 group",
                selectedCollection === collection.collection_id && "pr-1"
              )}
              onClick={() => onSelectCollection(collection.collection_id)}
            >
              {collection.collection_id === "favorites" ? (
                <Heart className="w-3 h-3 mr-1" />
              ) : (
                <Folder className="w-3 h-3 mr-1" />
              )}
              {collection.name}
              {selectedCollection === collection.collection_id && collection.collection_id !== "favorites" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCollection(collection.collection_id);
                    onSelectCollection(null);
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-foreground/20"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
