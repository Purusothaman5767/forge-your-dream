import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <span className="text-[10rem] font-display font-bold leading-none text-muted-foreground/10">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold">Page not found</h1>
              <p className="text-muted-foreground max-w-sm mx-auto">
                The page at <code className="text-xs bg-muted px-2 py-1 rounded">{location.pathname}</code> doesn't exist.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
