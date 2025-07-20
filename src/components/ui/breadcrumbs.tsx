"use client";
import { 
  Home, 
  ChevronRight, 
  MessageCircle, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code, 
  Search, 
  Eye,
  Sparkles,
  Bot,
  Palette,
  Camera,
  Mic,
  Terminal,
  Globe,
  Brain
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";

// Professional icon mapping for each AI tool
const getPageIcon = (path: string) => {
  const icons: Record<string, React.ReactNode> = {
    'ai-chat': <MessageCircle className="size-4" />,
    'ai-image': <ImageIcon className="size-4" />,
    'ai-video': <Video className="size-4" />,
    'ai-audio': <Music className="size-4" />,
    'ai-vision': <Eye className="size-4" />,
  };
  
  return icons[path] || <Sparkles className="size-4" />;
};

// Professional page titles
const getPageTitle = (path: string) => {
  const titles: Record<string, string> = {
    'ai-chat': 'AI Chat',
    'ai-image': 'AI Image',
    'ai-video': 'AI Video', 
    'ai-audio': 'AI Audio',
    'ai-vision': 'AI Vision',
  };
  
  return titles[path] || path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  const crumbs = [
    { 
      name: "AI Tools", 
      href: "/", 
      icon: <Home className="size-4" />,
      isHome: true
    },
    ...segments.map((seg, i) => ({
      name: getPageTitle(seg),
      href: "/" + segments.slice(0, i + 1).join("/"),
      icon: getPageIcon(seg),
      isHome: false,
    })),
  ];
  
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb" 
      className="w-full border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <ol className="flex items-center gap-1">
            {crumbs.map((crumb, i) => (
              <motion.li 
                key={crumb.href}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center"
              >
                <Link href={crumb.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      i === crumbs.length - 1 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-md ${
                      i === crumbs.length - 1 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {crumb.icon}
                    </div>
                    <span className="hidden sm:inline font-medium">{crumb.name}</span>
                  </motion.div>
                </Link>
                {i < crumbs.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    className="mx-2"
                  >
                    <ChevronRight className="size-4 text-muted-foreground/30" />
                  </motion.div>
                )}
              </motion.li>
            ))}
          </ol>

          {/* Current Page Badge */}
          {crumbs.length > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                <Bot className="size-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {crumbs[crumbs.length - 1].name}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
} 