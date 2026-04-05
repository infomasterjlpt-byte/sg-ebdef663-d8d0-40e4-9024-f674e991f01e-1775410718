import Link from "next/link";
import { useRouter } from "next/router";
import { Home, BookOpen, Clock, RotateCcw, TrendingUp, BookMarked, Lightbulb } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/mock-test", label: "Mock Test", icon: Clock },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/grammar-guide", label: "Grammar Guide", icon: BookMarked },
  { href: "/exam-tips", label: "Exam Tips", icon: Lightbulb },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}