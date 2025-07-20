'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { usePersistedState } from "@/lib/persistence";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { animations, hoverAnimations, variants } from "@/lib/animations";
import {
  Image as ImageIcon,
  Video,
  Music,
  Code,
  MessageCircle,
  Search,
  Eye,
  Sparkles,
  Bot,
  Zap,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";

const tools = [
  { 
    name: "AI Image", 
    href: "/ai-image", 
    icon: <ImageIcon className="size-5 sm:size-6" />, 
    description: "Create stunning images with AI",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  },
  { 
    name: "AI Video", 
    href: "/ai-video", 
    icon: <Video className="size-5 sm:size-6" />, 
    description: "Generate professional video content",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  { 
    name: "AI Audio", 
    href: "/ai-audio", 
    icon: <Music className="size-5 sm:size-6" />, 
    description: "Create and process audio with AI",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  { 
    name: "AI Chat", 
    href: "/ai-chat", 
    icon: <MessageCircle className="size-5 sm:size-6" />, 
    description: "Intelligent conversation with Grok AI",
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400"
  },
  { 
    name: "AI Vision", 
    href: "/ai-vision", 
    icon: <Eye className="size-5 sm:size-6" />, 
    description: "Advanced computer vision analysis",
    color: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-400"
  }
];

export default function HomePage() {
  const [globalState, updateGlobalState] = usePersistedState('global');

  useEffect(() => {
    updateGlobalState({ lastVisitedPage: '/' });
  }, [updateGlobalState]);

  return (
    <PageLayout>
      <ContentArea>
        <motion.div 
          className="max-w-6xl mx-auto p-6"
          {...variants.pageWrapper}
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            {...animations.fade}
          >
            <motion.h1 
              className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              {...animations.fade}
            >
              Professional AI Suite
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              {...animations.fade}
            >
              Free AI-powered productivity tools for content creation and analysis
            </motion.p>
          </motion.div>

          {/* Tools Grid */}
          <motion.div 
            className="mb-16"
            {...animations.fade}
          >
            <motion.h2 
              className="text-3xl font-bold text-center mb-12"
              {...animations.fade}
            >
              AI-Powered Tools
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={animations.stagger.container}
              initial="initial"
              animate="animate"
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  variants={animations.stagger.item}
                  custom={index}
                >
                  <Link href={tool.href}>
                    <motion.div {...hoverAnimations.card}>
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div 
                              className={`p-3 rounded-[3px] bg-gradient-to-br ${tool.color}`}
                              {...hoverAnimations.icon}
                            >
                              <div className={tool.iconColor}>
                                {tool.icon}
                              </div>
                            </motion.div>
                            <CardTitle className="text-xl">{tool.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{tool.description}</p>
                          <div className="mt-4 flex items-center text-sm text-primary">
                            Try now
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {globalState.lastVisitedPage && globalState.lastVisitedPage !== '/' && (
            <motion.div
              className="mt-8 text-center"
              {...animations.fade}
            >
              <Link href={globalState.lastVisitedPage}>
                <motion.div {...hoverAnimations.button}>
                  <Button variant="outline" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Continue from {globalState.lastVisitedPage}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </ContentArea>
    </PageLayout>
  );
}
