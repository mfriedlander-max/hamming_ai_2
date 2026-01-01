import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <Card className="p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-6">
            <Skeleton className="mb-3 h-5 w-56" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    </div>
  );
}
