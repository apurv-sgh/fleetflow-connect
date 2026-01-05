import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GovHeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const GovHeader = ({ onMenuClick, showMenu = false }: GovHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      {/* Tricolor Strip */}
      <div className="gov-header-strip" />
      
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Emblem & Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="National Emblem of India"
              className="gov-emblem h-10 md:h-12"
            />
            <div className="flex flex-col">
              <span className="text-xs md:text-sm text-muted-foreground font-medium">
                राष्ट्रीय सूचना विज्ञान केंद्र
              </span>
              <h1 className="text-sm md:text-lg font-display font-semibold text-foreground leading-tight">
                National Informatics Centre
              </h1>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Ministry of Electronics & Information Technology
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - NIC Logo */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-primary">GFAMS</span>
            <span className="text-xs text-muted-foreground">Transport Division</span>
          </div>
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base">
            NIC
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovHeader;
