// Standardized animation system for the entire app
// Minimal, professional animations with 0.1s transitions and 0.05 scale

export const animations = {
  // Page transitions
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Card animations
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Message animations
  message: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Button hover animations
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.05, ease: "easeOut" as const }
  },

  // Icon animations
  icon: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.05, ease: "easeOut" as const }
  },

  // Loading animations
  loading: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Sidebar animations
  sidebar: {
    initial: { x: -300 },
    animate: { x: 0 },
    exit: { x: -300 },
    transition: { type: "spring" as const, damping: 25, stiffness: 200 }
  },

  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Overlay animations
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Stagger animations for lists
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.05
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.1, ease: "easeOut" as const }
    }
  },

  // Fade animations
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Slide animations
  slide: {
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.1, ease: "easeOut" as const }
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.1, ease: "easeOut" as const }
    },
    left: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.1, ease: "easeOut" as const }
    },
    right: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.1, ease: "easeOut" as const }
    }
  }
};

// Animation variants for common components
export const variants = {
  // Page wrapper
  pageWrapper: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Content area
  contentArea: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Navigation items
  navItem: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Tool cards
  toolCard: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Chat messages
  chatMessage: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },

  // Generated content
  generatedContent: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  }
};

// Hover animations
export const hoverAnimations = {
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.05, ease: "easeOut" as const }
  },
  card: {
    whileHover: { scale: 1.01, y: -2 },
    whileTap: { scale: 0.99 },
    transition: { duration: 0.1, ease: "easeOut" as const }
  },
  icon: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.05, ease: "easeOut" as const }
  }
};

// Loading states
export const loadingStates = {
  spinner: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" as const }
  },
  pulse: {
    animate: { opacity: [0.5, 1, 0.5] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
  },
  dots: {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const }
  }
}; 