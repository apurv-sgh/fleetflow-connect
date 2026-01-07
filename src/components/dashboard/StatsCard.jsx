import { cn } from "@/lib/utils";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
}) => {
  return (
    <div className={cn("stats-card", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="stats-card-label">{title}</p>
          <p className="stats-card-value">{value}</p>
        </div>
        <div
          className={cn(
            "p-2 rounded-lg bg-primary/10",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;