
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        primaryContrast: "var(--primary-contrast)",

        bg: {
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
        },

        border: {
          DEFAULT: "var(--border-default)",
        },

        text: {
          main: "var(--text-main)",
          subtle: "var(--text-subtle)",
        },
      },

      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        "dynamic-primary":
          "0 4px 20px theme(colors.primary / 0.08), 0 0 30px theme(colors.primary / 0.05)",
      },
    },
  },
};
