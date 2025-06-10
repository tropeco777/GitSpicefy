"use client";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../SessionProvider";
import { LogOut, User } from "lucide-react";
import Logo from "./Logo";

interface NavItem {
  name: string;
  link: string;
  icon?: JSX.Element;
}

interface NavbarProps {
  navItems: NavItem[];
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ navItems, className }) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Always show navbar at the top of the page
    if (latest < 100) {
      setVisible(true);
    } else {
      // Only hide/show based on scroll direction after scrolling past 100px
      if (latest > previous && latest > 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    }
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-4 sm:top-10 inset-x-0 mx-auto backdrop-blur-md bg-white/90 dark:bg-dark-200/90 border border-gray-200/50 dark:border-dark-700/50 rounded-lg shadow-lg z-[5000] px-4 sm:px-8 py-3 sm:py-4 items-center justify-center space-x-2 sm:space-x-4",
          className
        )}
      >
        {/* Logo */}
        <Link href="/" className="mr-1 sm:mr-2">
          <Logo size="sm" showText={false} />
        </Link>

        {/* Separator */}
        <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1 sm:mx-2"></div>

        {navItems.map((navItem: NavItem, idx: number) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-gray-700 dark:text-gray-200 items-center flex space-x-1 hover:text-primary dark:hover:text-primary transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block font-medium">{navItem.name}</span>
          </Link>
        ))}

        {/* Profile Section */}
        <div className="relative">
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              {/* User Avatar */}
              <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block font-medium text-sm max-w-24 truncate">
                  {user.user_metadata?.full_name ||
                   user.user_metadata?.name ||
                   user.user_metadata?.preferred_username ||
                   user.email?.split('@')[0] ||
                   'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-300">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center space-x-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base"
            >
              Sign In
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
