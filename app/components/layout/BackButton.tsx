import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href, label = "Go back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="text-blue-600 hover:underline" aria-label={label}>
      <ArrowLeft className="h-5 w-5" />
    </Link>
  );
}
