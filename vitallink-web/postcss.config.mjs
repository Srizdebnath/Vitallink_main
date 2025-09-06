const config = {
  plugins: ["@tailwindcss/postcss"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          '50': '#f0f9f8',
          '100': '#dff2f0',
          '200': '#bfe5e2',
          '300': '#98d6d1',
          '400': '#6cc2bb',
          '500': '#4cb1a9', 
          '600': '#3b8e87',
          '700': '#31736e',
          '800': '#2b5d59',
          '900': '#264c49',
          '950': '#152c2a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
    }

export default config;
