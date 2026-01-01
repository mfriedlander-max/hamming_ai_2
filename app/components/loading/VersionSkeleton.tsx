import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function VersionSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-4">
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}
