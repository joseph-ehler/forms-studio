/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}", // Include wizard-react source
    "../dist/**/*.{js,ts}", // Include wizard-react dist
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
