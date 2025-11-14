'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingUp, Users, Bot, User, Shield, Settings, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/nextjs';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/feed', label: 'Explore', icon: TrendingUp },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/aegis', label: 'Aegis AI', icon: Bot },
  { href: '/profile', label: 'Profile', icon: User },
];

function NavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();

  // Check if user is admin from Clerk metadata or userStore
  const isAdmin = user?.isAdmin || clerkUser?.publicMetadata?.role === 'admin';

  const handleAdminClick = (e: React.MouseEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      toast.error('Access denied. Admin privileges required.');
      return;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <>
      {/* Navigation Items */}
      <ul className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-base
                  transition-smooth
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}

        {/* Admin Item - Only visible to admins */}
        {isAdmin && (
          <li>
            <Link
              href="/admin"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-base
                transition-smooth
                ${
                  pathname === '/admin'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }
              `}
              aria-current={pathname === '/admin' ? 'page' : undefined}
              onClick={handleAdminClick}
            >
              <Shield size={20} />
              <span className="font-medium">Admin Dashboard</span>
            </Link>
          </li>
        )}

        {/* Settings */}
        {/* <li>
          <Link
            href="/settings"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-base
              transition-smooth
              ${
                pathname === '/settings'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
              }
            `}
            aria-current={pathname === '/settings' ? 'page' : undefined}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </li> */}
      </ul>

      {/* Create Post Button */}
      <Link href="/new">
        <button className="w-full mt-6 px-4 py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-semibold rounded-base transition-smooth">
          Create Post
        </button>
      </Link>

      {/* Sign Out Button */}
      {/* <button
        onClick={handleSignOut}
        className="w-full mt-4 px-4 py-3 flex items-center justify-center gap-2 border border-border hover:bg-surface-hover rounded-base transition-smooth text-text-muted"
      >
        <LogOut size={20} />
        <span className="font-medium">Sign Out</span>
      </button> */}
    </>
  );
}

export default function LeftNav() {
  const isNavOpen = useUIStore((state) => state.isNavOpen);
  const pathname = usePathname();

  return (
    <motion.nav
      initial={false}
      animate={{
        width: isNavOpen ? '280px' : '80px',
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-surface border-r border-border overflow-y-auto overflow-x-hidden z-40"
    >
      <div className="p-4 h-full flex flex-col">
        {isNavOpen ? (
          <NavContent />
        ) : (
          /* Collapsed state - show only icons */
          <div className="flex flex-col items-center gap-2 w-full">

            {/* Nav Icons */}
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`p-3 rounded-base transition-smooth w-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-surface-hover text-text-muted hover:text-text'
                  }`}
                  title={label}
                >
                  <Icon size={22} />
                </Link>
              );
            })}

            {/* Settings Icon */}
            {/* <Link
              href="/settings"
              className={`p-3 rounded-base transition-smooth w-full flex items-center justify-center mt-auto ${
                pathname === '/settings'
                  ? 'bg-primary text-white'
                  : 'hover:bg-surface-hover text-text-muted hover:text-text'
              }`}
              title="Settings"
            >
              <Settings size={22} />
            </Link> */}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
