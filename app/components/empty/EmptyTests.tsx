import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function EmptyTests() {
  return (
    <Card className="p-8 text-center md:p-12">
      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        No test results
      </h3>
      <p className="text-sm text-gray-500">
        Upload a test batch to see results here.
      </p>
    </Card>
  );
}
