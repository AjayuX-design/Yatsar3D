/** Loading shape for the product page. Same aspect ratios as the real blocks. */
export function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="lg:grid lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="aspect-[4/5] rounded-card bg-mist" />
      </div>
      <div className="mt-6 space-y-4 lg:col-span-5 lg:mt-0">
        <div className="h-8 w-3/4 rounded-ctl bg-mist" />
        <div className="h-6 w-1/3 rounded-ctl bg-mist" />
        <div className="h-7 w-32 rounded-pill bg-mist" />
        <div className="h-12 rounded-ctl bg-mist" />
        <div className="h-32 rounded-card bg-mist" />
      </div>
    </div>
  );
}
