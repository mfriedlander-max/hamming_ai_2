import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function EmptyVersions() {
  return (
    <Card className="p-8 text-center md:p-12">
      <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        No version history yet
      </h3>
      <p className="text-sm text-gray-500">
        Versions are created when you apply suggestions to your prompt.
      </p>
    </Card>
  );
}
