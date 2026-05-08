import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['GFS Didot', 'Georgia', 'serif'],
        script: ['Dancing Script', 'cursive'],
        jost: ['Jost', 'sans-serif'],
      },
      colors: {
        cream: '#F9F2EC',
        parchment: '#F2E8DE',
        taupe: '#C4A882',
        sienna: '#8B5E3C',
        'sienna-dark': '#5C3820',
        'btn-create': '#C49090',
        'btn-gift': '#C47878',
      },
    },
  },
  plugins: [],
}
export default config

