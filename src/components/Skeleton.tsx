import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component for loading states.
 * Uses the .skeleton class from globals.css which includes breathe and shimmer animations.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn("skeleton", className)} 
    />
  );
}
