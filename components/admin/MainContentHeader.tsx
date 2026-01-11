
export function MainContentHeader({ activeItem, children }: { activeItem: string; children?: React.ReactNode }) {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background">
      <div className="max-w-8xl text-foreground">
        <h1 className="text-3xl font-bold mb-2 capitalize">{activeItem}</h1>
        <p className="text-muted-foreground">
          This is the {activeItem} section of your admin dashboard.
        </p>
        <div className="mt-6 p-6 rounded-lg bg-card border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}