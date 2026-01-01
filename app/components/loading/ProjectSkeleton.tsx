import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProjectSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-4 h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </Card>
  );
}
