export function CardSkeleton() {
  return (
    <div className="shrink-0" style={{ width: 200 }}>
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="mt-3 px-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="skeleton w-1 h-6 rounded-full" />
        <div className="skeleton h-6 w-40 rounded-lg" />
      </div>
      <div className="flex gap-4 overflow-hidden px-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden rounded-2xl skeleton">
      <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4">
        <div className="skeleton h-12 w-96 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded" />
        <div className="skeleton h-4 w-80 rounded" />
        <div className="flex gap-3 mt-6">
          <div className="skeleton h-12 w-48 rounded-lg" />
          <div className="skeleton h-12 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-[50vh] w-full rounded-2xl" />
      <div className="space-y-4 px-4">
        <div className="skeleton h-10 w-96 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded" />
        <div className="skeleton h-20 w-full max-w-2xl rounded-lg" />
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] rounded-xl" />
          <div className="mt-3 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
