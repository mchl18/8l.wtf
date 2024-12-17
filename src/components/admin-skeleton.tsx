import { Skeleton } from "@/components/ui/skeleton";

export const AdminSkeleton = () => (
  <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 items-center border-b border-purple-600 last:border-b-0 pb-4">
    <Skeleton className="h-4 w-4 rounded" />
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-48" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-48 sm:w-64" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-40" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-40" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 rounded" />
  </div>
);
