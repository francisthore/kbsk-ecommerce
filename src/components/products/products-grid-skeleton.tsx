export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-light-200 p-4"
        >
          <div className="aspect-square bg-light-200 rounded-lg mb-4" />
          <div className="h-4 bg-light-200 rounded mb-2" />
          <div className="h-3 bg-light-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
