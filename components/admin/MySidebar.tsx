import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  FileWarning, 
  RotateCcw, 
  Settings, 
  ChevronLeft, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MySidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'product', label: 'Product', icon: Package },
    { id: 'order', label: 'Order', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'warranty', label: 'Warranty Claim', icon: FileWarning },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          isExpanded ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col relative`}
      >
        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-9 w-6 h-6 rounded-full z-10 shadow-sm"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              !isExpanded ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            {isExpanded && (
              <span className="font-semibold text-lg text-sidebar-foreground">
                Admin Panel
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 ${
                      isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
              JD
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-sidebar-foreground truncate">
                  John Doe
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  john.doe@example.com
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size={isExpanded ? "default" : "icon"}
              onClick={() => setIsDark(!isDark)}
              className="flex-1"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isExpanded && <span className="ml-2 text-sm font-medium">Theme</span>}
            </Button>
            <Button
              variant="destructive"
              size={isExpanded ? "default" : "icon"}
              className="flex-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {isExpanded && <span className="ml-2 text-sm font-medium">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-background">
        <div className="max-w-4xl text-foreground">
          <h1 className="text-3xl font-bold mb-2 capitalize">{activeItem}</h1>
          <p className="text-muted-foreground">
            This is the {activeItem} section of your admin dashboard.
          </p>
          <div className="mt-6 p-6 rounded-lg bg-card border border-border">
            <p className="text-card-foreground">
              Your content goes here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}