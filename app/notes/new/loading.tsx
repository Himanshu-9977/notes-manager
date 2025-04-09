import { Skeleton } from "@/components/ui/skeleton"

export default function NewNoteLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
