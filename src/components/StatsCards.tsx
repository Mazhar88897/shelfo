import { Card } from "@/components/ui/card";
import { BookMarked, BookOpen, Book, FileText, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalBooks: number;
    finishedBooks: number;
    currentlyReading: number;
    totalPagesRead: number;
    averageRating: number;
    reviewsCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Books",
      value: stats.totalBooks,
      icon: Book,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      label: "Finished",
      value: stats.finishedBooks,
      icon: BookMarked,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Reading",
      value: stats.currentlyReading,
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Pages Read",
      value: stats.totalPagesRead.toLocaleString(),
      icon: FileText,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      label: "Avg Rating",
      value: stats.averageRating || "-",
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Reviews",
      value: stats.reviewsCount,
      icon: MessageSquare,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <Card
          key={item.label}
          className={cn(
            "p-4 flex flex-col items-center text-center",
            "transition-all duration-200 hover:scale-105",
            "book-card-shadow"
          )}
        >
          <div className={cn("p-2 rounded-full mb-2", item.bgColor)}>
            <item.icon className={cn("w-5 h-5", item.color)} />
          </div>
          <p className="text-2xl font-heading font-bold">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
