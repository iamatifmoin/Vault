import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        vault: {
          bg: "var(--vault-surface-0)",
          surface: "var(--vault-surface-1)",
          raised: "var(--vault-surface-2)",
          inset: "var(--vault-surface-inset)",
          border: "var(--border)",
          muted: "#52525b",
          secondary: "#a1a1aa",
          brand: "var(--vault-brand)",
          "brand-foreground": "var(--vault-brand-foreground)",
          "brand-muted": "var(--vault-brand-muted)",
          success: "#22c55e",
          optimized: "#eab308",
          medium: "#3b82f6",
          hard: "#ef4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        "sidebar-width": "220px",
        "container-padding": "24px",
        gutter: "16px",
        "stack-sm": "8px",
        "stack-md": "12px",
        "stack-lg": "24px",
      },
      boxShadow: {
        subtle: "0 0 0 1px rgba(63, 63, 70, 0.65)",
        "brand-glow": "0 0 16px rgba(229, 255, 93, 0.15)",
      },
      keyframes: {
        "page-enter": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.85)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "page-enter": "page-enter 180ms ease-out both",
        "fade-in-up": "fade-in-up 200ms ease-out both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#d4d4d8",
            "--tw-prose-headings": "#fafafa",
            "--tw-prose-links": "#fafafa",
            "--tw-prose-bold": "#fafafa",
            "--tw-prose-code": "#fafafa",
            "--tw-prose-pre-code": "#d4d4d8",
            "--tw-prose-pre-bg": "#09090b",
            "--tw-prose-quotes": "#a1a1aa",
            "--tw-prose-quote-borders": "#3f3f46",
            "--tw-prose-hr": "#3f3f46",
            "--tw-prose-th-borders": "#3f3f46",
            "--tw-prose-td-borders": "#3f3f46",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
