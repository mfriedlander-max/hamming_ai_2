// Centralized animation variants for Framer Motion
// All animations respect reduced motion preferences

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

// Container for staggered children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerContainerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20,
  },
};

export const buttonTap = {
  scale: 0.98,
};

// Card hover animation
export const cardHover = {
  y: -4,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 25,
  },
};

// Icon hover animation
export const iconHover = {
  scale: 1.1,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 15,
  },
};

// Scroll reveal variants (use with whileInView)
export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export const scrollRevealSlow = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: "easeOut" as const },
};
