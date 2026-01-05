import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, User, MapPin, Clock, Star, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Booking {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDesignation: string;
  pickupLocation: string;
  dropLocation: string;
  requestedTime: string;
  status: "pending" | "approved" | "assigned" | "in-progress" | "completed" | "cancelled";
  vehicleNumber?: string;
  driverName?: string;
  driverRating?: number;
  estimatedTime?: string;
}

interface BookingCardProps {
  booking: Booking;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  className?: string;
}

const statusConfig = {
  pending: { label: "Pending", variant: "warning" as const },
  approved: { label: "Approved", variant: "info" as const },
  assigned: { label: "Driver Assigned", variant: "success" as const },
  "in-progress": { label: "In Progress", variant: "busy" as const },
  completed: { label: "Completed", variant: "success" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

const BookingCard = ({
  booking,
  onApprove,
  onReject,
  onViewDetails,
  showActions = true,
  className,
}: BookingCardProps) => {
  const status = statusConfig[booking.status];

  return (
    <div
      className={cn(
        "gov-card p-4 space-y-4 hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{booking.requesterName}</p>
            <p className="text-xs text-muted-foreground">{booking.requesterDesignation}</p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Route Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="text-foreground">{booking.pickupLocation}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Drop</p>
            <p className="text-foreground">{booking.dropLocation}</p>
          </div>
        </div>
      </div>

      {/* Time & Vehicle Info */}
      <div className="flex items-center justify-between text-sm border-t border-border pt-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{booking.requestedTime}</span>
        </div>
        
        {booking.vehicleNumber && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>{booking.vehicleNumber}</span>
          </div>
        )}

        {booking.driverRating && (
          <div className="flex items-center gap-1 text-secondary">
            <Star className="h-4 w-4 fill-current" />
            <span>{booking.driverRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && booking.status === "pending" && (
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="success" onClick={onApprove} className="flex-1">
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={onReject} className="flex-1">
            Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={onViewDetails}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showActions && booking.status !== "pending" && (
        <Button size="sm" variant="outline" onClick={onViewDetails} className="w-full">
          View Details
        </Button>
      )}
    </div>
  );
};

export default BookingCard;
