/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./packages/**/*.{ts,tsx,html}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Bridge DS tokens → Tailwind utilities
      colors: {
        primary: "var(--ds-color-primary)",
        "primary-hover": "var(--ds-color-primary-hover)",
        surface: "var(--ds-color-surface-base)",
        "surface-subtle": "var(--ds-color-surface-subtle)",
        text: "var(--ds-color-text)",
        "text-subtle": "var(--ds-color-text-subtle)",
        border: "var(--ds-color-border-subtle)",
        error: "var(--ds-color-feedback-error)",
        success: "var(--ds-color-feedback-success)",
      },
      spacing: {
        // Use DS spacing tokens
        3: "var(--ds-space-3)",
        4: "var(--ds-space-4)",
        5: "var(--ds-space-5)",
        6: "var(--ds-space-6)",
        8: "var(--ds-space-8)",
      },
      borderRadius: {
        lg: "var(--ds-radius-lg)",
        full: "var(--ds-radius-full)",
      },
      boxShadow: {
        "layer-1": "var(--ds-shadow-layer-1)",
        "layer-2": "var(--ds-shadow-layer-2)",
      },
      zIndex: {
        panel: "var(--ds-z-lane-panel)",
        modal: "var(--ds-z-lane-modal)",
        overlay: "var(--ds-z-lane-overlay)",
      },
      minHeight: {
        touch: "var(--ds-touch-target)",
      },
      minWidth: {
        touch: "var(--ds-touch-target)",
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
  ],
};
