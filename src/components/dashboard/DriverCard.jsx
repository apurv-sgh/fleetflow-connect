import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Phone, Car, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig = {
  1: { label: "Reserved Pool", variant: "tier1", color: "text-success" },
  2: { label: "Priority", variant: "tier2", color: "text-info" },
  3: { label: "Standard", variant: "tier3", color: "text-warning" },
  4: { label: "Probation", variant: "tier4", color: "text-destructive" },
};

const DriverCard = ({
  driver,
  onToggleAvailability,
  onViewProfile,
  onAssign,
  showActions = true,
  compact = false,
  className,
}) => {
  const tier = tierConfig[driver.tier];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 gov-card hover:shadow-md transition-shadow cursor-pointer",
          className
        )}
        onClick={onViewProfile}
      >
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
            {driver.name.charAt(0)}
          </div>
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
              driver.isAvailable ? "bg-success" : "bg-muted-foreground"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{driver.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-secondary fill-current" />
              {driver.rating.toFixed(1)}
            </span>
            <Badge variant={tier.variant} className="text-[10px] px-1.5 py-0">
              {tier.label}
            </Badge>
          </div>
        </div>
        {driver.vehicleNumber && (
          <span className="text-xs text-muted-foreground">{driver.vehicleNumber}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("gov-card p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-lg text-primary">
              {driver.name.charAt(0)}
            </div>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                driver.isAvailable ? "bg-success" : "bg-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">{driver.name}</p>
            <p className="text-xs text-muted-foreground">{driver.licenseNumber}</p>
          </div>
        </div>
        <Badge variant={tier.variant}>{tier.label}</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-secondary font-semibold">
            <Star className="h-4 w-4 fill-current" />
            {driver.rating.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ({driver.totalRatings})
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="font-semibold text-foreground">{driver.completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Completion</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="font-semibold text-foreground">{driver.totalTrips}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Trips</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        {driver.vehicleNumber && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>{driver.vehicleNumber} • {driver.vehicleType}</span>
          </div>
        )}
        {driver.currentLocation && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{driver.currentLocation}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{driver.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{driver.experience} years experience</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant={driver.isAvailable ? "success" : "outline"}
            onClick={onToggleAvailability}
            className="flex-1 gap-1"
          >
            {driver.isAvailable ? (
              <>
                <ToggleRight className="h-4 w-4" /> Available
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" /> Unavailable
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={onViewProfile}>
            Profile
          </Button>
          {onAssign && driver.isAvailable && (
            <Button size="sm" variant="gov" onClick={onAssign}>
              Assign
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverCard;
