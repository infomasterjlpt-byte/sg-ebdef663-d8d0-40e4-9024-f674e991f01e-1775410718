import Link from "next/link";
import { useRouter } from "next/router";
import { Home, BookOpen, Brain, Clock, TrendingUp, BookText, Lightbulb, CreditCard } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/review", label: "Review", icon: Brain },
  { href: "/mock-test", label: "Mock Test", icon: Clock },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/grammar-guide", label: "Grammar", icon: BookText },
  { href: "/exam-tips", label: "Exam Tips", icon: Lightbulb },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="w-64 border-r border-border bg-card h-screen sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}