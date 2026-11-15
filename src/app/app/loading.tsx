export default function AppLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-9 w-56" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-9 w-24" />
          <div className="skeleton h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="panel p-5 space-y-3">
            <div className="flex justify-between">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-8 w-8 rounded-[8px]" />
            </div>
            <div className="skeleton h-9 w-16" />
            <div className="skeleton h-3.5 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="panel p-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
        <div className="panel p-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

