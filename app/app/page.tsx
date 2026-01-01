import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Improve Your Prompts
          <br />
          <span className="text-blue-600">With Evidence</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Analyze test batches against your system prompts. Get traceable,
          minimal edit suggestions backed by evidence. Every change justified.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/projects/new">
            <Button size="lg">Analyze a Test Batch</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
