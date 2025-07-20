"use client";
import { 
  Home, 
  MessageCircle, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code, 
  Search, 
  Eye,
  Sparkles,
  Bot,
  Menu,
  X,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { animations, hoverAnimations } from "@/lib/animations";
import { useSidebar } from "@/components/SidebarProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const navigationItems = [
  { 
    name: "Home", 
    href: "/", 
    icon: <Home className="size-4" />,
    description: "AI Tools Suite"
  },
  { 
    name: "AI Image", 
    href: "/ai-image", 
    icon: <ImageIcon className="size-4" />,
    description: "Create images with AI"
  },
  { 
    name: "AI Chat", 
    href: "/ai-chat", 
    icon: <MessageCircle className="size-4" />,
    description: "Intelligent conversation"
  },
  { 
    name: "AI Video", 
    href: "/ai-video", 
    icon: <Video className="size-4" />,
    description: "Generate video content"
  },
  { 
    name: "AI Audio", 
    href: "/ai-audio", 
    icon: <Music className="size-4" />,
    description: "Create audio with AI"
  },
  { 
    name: "AI Vision", 
    href: "/ai-vision", 
    icon: <Eye className="size-4" />,
    description: "Computer vision analysis"
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div 
        className="lg:hidden fixed top-4 left-4 z-50"
        {...animations.fade}
      >
        <motion.div {...hoverAnimations.button}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="h-10 w-10 p-0"
          >
            {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            {...animations.overlay}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            {...animations.sidebar}
            className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <motion.div 
                className="flex flex-col p-3 border-b border-border"
                {...animations.fade}
              >
                {/* Home Section */}
                <div className="flex items-center justify-between mb-3">
                  <Link href="/" onClick={() => setIsMobileOpen(false)}>
                    <motion.div 
                      className="flex items-center gap-2 p-2 rounded-[3px] hover:bg-muted/50 transition-colors"
                      {...hoverAnimations.card}
                    >
                      <motion.div 
                        className="p-1.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[3px]"
                        {...hoverAnimations.icon}
                      >
                        <Sparkles className="size-5 text-primary" />
                      </motion.div>
                      <div>
                        <h1 className="font-semibold text-base">Home</h1>
                        <p className="text-xs text-muted-foreground">AI Tools Suite</p>
                      </div>
                    </motion.div>
                  </Link>
                  <motion.div {...hoverAnimations.button}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="size-4" />
                    </Button>
                  </motion.div>
                </div>

                {/* User Section */}
                {user ? (
                  <motion.div className="space-y-2" {...animations.fade}>
                    <div className="bg-muted/50 rounded-[3px] p-3">
                      <div className="flex items-center gap-3 mb-2">
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.full_name || user.email || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={signOut}
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div {...hoverAnimations.button}>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAuthModalOpen(true)}
                      className="w-full h-10"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* Mobile Navigation */}
              <motion.nav 
                className="flex-1 p-3 space-y-1"
                variants={animations.stagger.container}
                initial="initial"
                animate="animate"
              >
                {navigationItems.slice(1).map((item, index) => (
                  <motion.div
                    key={item.href}
                    variants={animations.stagger.item}
                    custom={index}
                  >
                    <Link href={item.href} onClick={() => setIsMobileOpen(false)}>
                      <motion.div
                        {...hoverAnimations.card}
                        className={`flex items-center gap-3 p-2.5 rounded-[3px] transition-all duration-200 ${
                          pathname === item.href
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <motion.div 
                          className={`flex items-center justify-center w-7 h-7 rounded-[3px] ${
                            pathname === item.href
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          {...hoverAnimations.icon}
                        >
                          {item.icon}
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        {...animations.sidebar}
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-background border-r border-border z-30 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Desktop Header */}
          <motion.div 
            className={`flex flex-col border-b border-border ${
              isCollapsed ? 'p-2' : 'p-3'
            }`}
            {...animations.fade}
          >
            {/* Home Section */}
            <div className="flex items-center justify-between mb-3">
              {!isCollapsed && (
                <Link href="/">
                  <motion.div
                    className="flex items-center gap-2 p-2 rounded-[3px] hover:bg-muted/50 transition-colors"
                    {...hoverAnimations.card}
                  >
                    <motion.div 
                      className="p-1.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[3px]"
                      {...hoverAnimations.icon}
                    >
                      <Sparkles className="size-5 text-primary" />
                    </motion.div>
                    <div>
                      <h1 className="font-semibold text-base">Home</h1>
                      <p className="text-xs text-muted-foreground">AI Tools Suite</p>
                    </div>
                  </motion.div>
                </Link>
              )}
              <motion.div {...hoverAnimations.button}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`p-0 ${isCollapsed ? 'h-8 w-8' : 'h-7 w-7'}`}
                >
                  {isCollapsed ? <Menu className="size-4" /> : <X className="size-4" />}
                </Button>
              </motion.div>
            </div>

            {/* User Section */}
            {user ? (
              <motion.div 
                className={`${isCollapsed ? 'flex justify-center' : 'space-y-2'}`}
                {...animations.fade}
              >
                {!isCollapsed && (
                  <div className="bg-muted/50 rounded-[3px] p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata?.full_name || user.email || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={signOut}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
                {isCollapsed && (
                  <div className="flex flex-col items-center gap-2">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || user.email || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={signOut}
                      className="h-8 w-8 p-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div {...hoverAnimations.button}>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className={`w-full ${isCollapsed ? 'h-8 w-8 p-0' : 'h-10'}`}
                >
                  {isCollapsed ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className={`flex-1 ${
              isCollapsed ? 'p-2 space-y-1' : 'p-3 space-y-1'
            }`}
            variants={animations.stagger.container}
            initial="initial"
            animate="animate"
          >
            {navigationItems.slice(1).map((item, index) => (
              <motion.div
                key={item.href}
                variants={animations.stagger.item}
                custom={index}
              >
                <Link href={item.href}>
                  <motion.div
                    {...hoverAnimations.card}
                    className={`flex items-center transition-all duration-200 ${
                      isCollapsed 
                        ? `justify-center p-2 rounded-[3px] ${
                            pathname === item.href
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`
                        : `gap-2.5 p-2.5 rounded-[3px] ${
                            pathname === item.href
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`
                    }`}
                  >
                    <motion.div 
                      className={`flex items-center justify-center rounded-[3px] ${
                        isCollapsed 
                          ? 'w-8 h-8' 
                          : 'w-7 h-7'
                      } ${
                        pathname === item.href
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      {...hoverAnimations.icon}
                    >
                      {item.icon}
                    </motion.div>
                    {!isCollapsed && (
                      <motion.div
                        className="flex-1"
                        {...animations.fade}
                      >
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>
      </motion.aside>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
} 