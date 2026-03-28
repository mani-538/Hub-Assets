import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FolderKanban, PlusCircle, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
        toast({ title: "Logged out successfully" });
      },
    });
  };

  if (!user) return null;

  const isStudent = user.role === "student";

  const navLinks = isStudent
    ? [
        { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
        { label: "My Projects", href: "/student/projects", icon: FolderKanban },
        { label: "Add Project", href: "/student/projects/new", icon: PlusCircle },
        { label: "Profile", href: "/student/profile", icon: User },
      ]
    : [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Manage Projects", href: "/admin/projects", icon: FolderKanban },
        { label: "Manage Users", href: "/admin/users", icon: Users },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href={isStudent ? "/student/dashboard" : "/admin/dashboard"} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:inline-block">
              Project Hub
            </span>
          </Link>

          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold">{user.name || user.username}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
