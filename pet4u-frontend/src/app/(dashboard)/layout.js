'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import NotificationDropdown from '../_component/notifications/NotificationDropDown';
import { 
  LogOut, 
  Home, 
  Heart, 
  Settings, 
  PawPrint, 
  List, 
  Plus, 
  MessageSquare, 
  Inbox, 
  FileText,
  Shield,
  Search, 
  TrendingUp, 
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from '@/components/Toggle';

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth({ requireAuth: true });
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount: messageUnreadCount } = useSelector((state) => state.messages);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', icon: Home, label: 'Home', show: true },
      { href: '/pets', icon: Search, label: 'Browse', show: true },
    ];

    if (user?.role === 'shelter') {
      return [
        ...baseItems,
        { href: '/my-pets', icon: List, label: 'My Pets', show: true },
        { href: '/pets/create', icon: Plus, label: 'Add Pet', show: true, hideOnMobile: true },
        { href: '/adoption-requests', icon: Inbox, label: 'Requests', show: true },
      ];
    } else if (user?.role === 'adopter') {
      return [
        ...baseItems,
        { href: '/favorites', icon: Heart, label: 'Favorites', show: true },
        { href: '/my-requests', icon: FileText, label: 'Requests', show: true },
      ];
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        { href: '/admin', icon: Shield, label: 'Admin', show: true },
        { href: '/analytics', icon: TrendingUp, label: 'Analytics', show: true },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    // ✅ Added flex flex-col and min-h-screen
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      {/* Top Header - Desktop & Mobile */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
                Pet4u
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Messages with badge */}
              <Link
                href="/messages"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  isActive('/messages')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <MessageSquare size={18} />
                <span>Messages</span>
                {messageUnreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                  </Badge>
                )}
              </Link>
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'shelter' && (
                    <DropdownMenuItem asChild>
                      <Link href="/analytics" className="cursor-pointer">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/payments" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payments
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle/>
            </div>

            {/* Mobile Right Side */}
            <div className="flex lg:hidden items-center gap-2">
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-card">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>

              {/* Additional Menu Items for Mobile */}
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
              >
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </Link>

              {user?.role === 'shelter' && (
                <>
                  <Link
                    href="/pets/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                  >
                    <Plus size={20} />
                    <span className="font-medium">Add New Pet</span>
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                  >
                    <TrendingUp size={20} />
                    <span className="font-medium">Analytics</span>
                  </Link>
                </>
              )}

              <Link
                href="/payments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
              >
                <CreditCard size={20} />
                <span className="font-medium">Payments</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                >
                  <Shield size={20} />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 text-destructive w-full"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - ✅ Added flex-1 to push footer down */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only (LinkedIn Style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 backdrop-blur-sm bg-card/95">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-primary'
              }`}
            >
              <div className={`relative ${isActive(item.href) ? 'scale-110' : ''} transition-transform`}>
                <item.icon size={22} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                {item.href === '/messages' && messageUnreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-destructive-foreground font-bold">
                      {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive(item.href) ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* Fifth item - Messages */}
          <Link
            href="/messages"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive('/messages')
                ? 'text-primary'
                : 'text-muted-foreground active:text-primary'
            }`}
          >
            <div className={`relative ${isActive('/messages') ? 'scale-110' : ''} transition-transform`}>
              <MessageSquare size={22} strokeWidth={isActive('/messages') ? 2.5 : 2} />
              {messageUnreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-destructive-foreground font-bold">
                    {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                  </span>
                </div>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/messages') ? 'font-semibold' : ''}`}>
              Messages
            </span>
          </Link>


        </div>
      </nav>

      {/* Footer - Hidden on Mobile, Visible on Desktop - ✅ Added mt-auto */}
      <footer className="hidden lg:block bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Pet4u. All rights reserved. Made with ❤️ for pets.
          </div>
        </div>
      </footer>
    </div>
  );
}
