import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </Card>
    </div>
  );
}
