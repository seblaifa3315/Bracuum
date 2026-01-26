
type MainContentHeaderProps = {
  activeItem: string
  children: React.ReactNode
}

export function MainContentHeader({ activeItem, children }: MainContentHeaderProps) {
  return (
    <div className="flex-1 py-8 px-10 overflow-y-auto bg-background">
      <div className="max-w-8xl text-foreground">  
          {children} 
      </div>
    </div>
  );
}