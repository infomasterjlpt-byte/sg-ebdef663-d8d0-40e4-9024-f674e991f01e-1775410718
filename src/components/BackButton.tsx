import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  // Don't show on homepage
  if (router.pathname === "/") {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-[#666] hover:text-[#cc1f1f] transition-colors text-sm mb-6"
      style={{ marginLeft: '16px' }}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}