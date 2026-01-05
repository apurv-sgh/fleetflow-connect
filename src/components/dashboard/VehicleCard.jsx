import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Fuel, Calendar, Wrench, User } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  available: { label: "Available", variant: "available" },
  "in-use": { label: "In Use", variant: "busy" },
  maintenance: { label: "Maintenance", variant: "maintenance" },
  reserved: { label: "Reserved", variant: "reserved" },
  retired: { label: "Retired", variant: "offline" },
};

const typeIcons = {
  sedan: "🚗",
  suv: "🚙",
  van: "🚐",
  bus: "🚌",
};

const VehicleCard = ({
  vehicle,
  onViewDetails,
  onAssign,
  onMaintenance,
  showActions = true,
  className,
}) => {
  const status = statusConfig[vehicle.status];

  return (
    <div className={cn("gov-card p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
            {typeIcons[vehicle.type]}
          </div>
          <div>
            <p className="font-semibold text-foreground">{vehicle.registrationNumber}</p>
            <p className="text-sm text-muted-foreground">{vehicle.model}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant={vehicle.pool === "reserved" ? "reserved" : "outline"} className="text-xs">
            {vehicle.pool === "reserved" ? "Reserved Pool" : "Non-Reserved"}
          </Badge>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Car className="h-4 w-4" />
          <span className="capitalize">{vehicle.type} • {vehicle.seatingCapacity} seats</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Fuel className="h-4 w-4" />
          <span className="capitalize">{vehicle.fuelType}</span>
        </div>
        {vehicle.currentLocation && (
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <MapPin className="h-4 w-4" />
            <span>{vehicle.currentLocation}</span>
          </div>
        )}
        {vehicle.nextServiceDue && (
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Wrench className="h-4 w-4" />
            <span>Service Due: {vehicle.nextServiceDue}</span>
          </div>
        )}
      </div>

      {/* Assignment Info */}
      {(vehicle.assignedDriverName || vehicle.assignedHOGName) && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          {vehicle.assignedDriverName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="text-foreground">Driver: {vehicle.assignedDriverName}</span>
            </div>
          )}
          {vehicle.assignedHOGName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-secondary" />
              <span className="text-foreground">HOG: {vehicle.assignedHOGName}</span>
            </div>
          )}
        </div>
      )}

      {/* Total KM */}
      {vehicle.totalKm && (
        <div className="text-xs text-muted-foreground">
          Total Distance: {vehicle.totalKm.toLocaleString()} km
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onViewDetails} className="flex-1">
            Details
          </Button>
          {vehicle.status === "available" && (
            <Button size="sm" variant="gov" onClick={onAssign} className="flex-1">
              Assign
            </Button>
          )}
          <Button size="sm" variant="warning" onClick={onMaintenance}>
            <Wrench className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
