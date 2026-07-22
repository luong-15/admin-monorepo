import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background, var(--background))",
        foreground: "var(--color-foreground, var(--foreground))",
        card: "var(--color-card, var(--card))",
        "card-foreground": "var(--color-card-foreground, var(--card-foreground))",
        primary: "var(--color-primary, var(--primary))",
        "primary-foreground":
          "var(--color-primary-foreground, var(--primary-foreground))",
        secondary: "var(--color-secondary, var(--secondary))",
        "secondary-foreground":
          "var(--color-secondary-foreground, var(--secondary-foreground))",
        muted: "var(--color-muted, var(--muted))",
        "muted-foreground":
          "var(--color-muted-foreground, var(--muted-foreground))",
        accent: "var(--color-accent, var(--accent))",
        "accent-foreground":
          "var(--color-accent-foreground, var(--accent-foreground))",
        destructive: "var(--color-destructive, var(--destructive))",
        "destructive-foreground":
          "var(--color-destructive-foreground, var(--destructive-foreground))",
        border: "var(--color-border, var(--border))",
        input: "var(--color-input, var(--input))",
        ring: "var(--color-ring, var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius-lg, 0.5rem)",
        md: "var(--radius-md, 0.375rem)",
        sm: "var(--radius-sm, 0.25rem)",
        xl: "var(--radius-xl, 1.125rem)",
      },
    },
  },
  plugins: [],
} satisfies Config;
