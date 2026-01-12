import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromptLabLogo } from "@/components/icons/PromptLabLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-smooth">
              <PromptLabLogo size={28} className="text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">PromptLab</span>
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
            <Link href="/dashboard">
              <Button>New Prompt</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
