// Shared framer-motion variants — import these instead of defining inline
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
};

// For list items inside a stagger container
export const listItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};
