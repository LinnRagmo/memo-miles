import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TopBar = () => {
  const navItems = [
    { title: "Home", path: "/" },
    { title: "Inspo", path: "/inspo" },
    { title: "Plan", path: "/plan" },
    { title: "Journal", path: "/journal" },
  ];

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center gap-8">
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
    </nav>
  );
};

export default TopBar;
