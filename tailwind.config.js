/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.html',
    './src/**/*.js',
  ],
  safelist: [
    'md:w-0',
    'md:w-64',
    'translate-x-[-100%]',
    'md:translate-x-0'
  ],
  theme: { extend: {} },
  plugins: [],
}
