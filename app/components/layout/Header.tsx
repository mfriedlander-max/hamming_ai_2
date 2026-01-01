import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="transition-smooth text-xl font-semibold text-gray-900">
              PromptLab
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className="transition-smooth text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div>
            <Link href="/projects/new">
              <Button>New Analysis</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
