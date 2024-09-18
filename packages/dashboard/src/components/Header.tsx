import logo from "../assets/logo.svg";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const { pathname } = useLocation();

  return (
    <div className="p-4 border-b border-border flex h-16">
      <Link to="/" className="flex gap-2 items-center">
        <img src={logo} className="w-[24px]" />
        <span className="font-medium">Mixwave</span>
      </Link>
      <div className="flex items-center gap-8 ml-8">
        <Link
          to="/jobs"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/jobs") && "text-black",
          )}
        >
          jobs
        </Link>
        <Link
          to="/api"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/api") && "text-black",
          )}
        >
          api
        </Link>
        <Link
          to="/player"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/player") && "text-black",
          )}
        >
          player
        </Link>
      </div>
    </div>
  );
}
