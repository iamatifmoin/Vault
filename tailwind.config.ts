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
          bg: "#09090b",
          surface: "#18181b",
          raised: "#27272a",
          border: "#3f3f46",
          muted: "#52525b",
          secondary: "#a1a1aa",
          success: "#22c55e",
          optimized: "#eab308",
          medium: "#3b82f6",
          hard: "#ef4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
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
