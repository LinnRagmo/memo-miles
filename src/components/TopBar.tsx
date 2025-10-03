import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

const TopBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { title: "Home", path: "/" },
    { title: "Inspo", path: "/inspo" },
    { title: "Plan", path: "/plan" },
    { title: "Journal", path: "/journal" },
  ];

  const handleAuth = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm font-bold uppercase tracking-wide transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
        
        <Button
          onClick={handleAuth}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          {user ? (
            <>
              <LogOut className="w-4 h-4" />
              Sign Out
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default TopBar;
