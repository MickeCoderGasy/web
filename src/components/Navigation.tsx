import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, TrendingUp, History, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/chat", label: "AI Chat", icon: MessageSquare },
  { path: "/history", label: "Historique", icon: History },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:static md:bottom-auto">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between p-6 glass-card border-b border-border/50 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Qubext
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Trading</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden glass-card border-t border-border/50 p-3 backdrop-blur-2xl">
        <div className="flex justify-around items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "mobile-nav-item flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group",
                location.pathname === item.path
                  ? "active text-primary shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="icon-container relative">
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    location.pathname === item.path && "scale-110"
                  )}
                />
                {location.pathname === item.path && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
            </Link>
          ))}
          
          {/* Mobile Theme Toggle */}
          <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary/50 min-w-0 flex-1 group">
            <div className="relative">
              <ThemeToggle variant="mobile" />
            </div>
            <span className="text-xs font-medium truncate max-w-[60px]">Thème</span>
          </div>
          
          {/* Mobile User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary/50 min-w-0 flex-1 group">
                <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs font-medium truncate max-w-[60px]">Compte</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
