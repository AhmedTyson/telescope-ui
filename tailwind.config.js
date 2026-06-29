/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/js/**/*.{vue,js}',
        './resources/views/**/*.blade.php',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                telescope: {
                    accent: '#a855f7',
                    'accent-light': '#c084fc',
                    border: '#1f1f1f',
                    card: '#0a0a0a',
                    dark: '#000000',
                    darker: '#000000',
                    sidebar: '#0a0a0a'
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 15px -3px rgba(168, 85, 247, 0.25)',
            }
        },
    },
    plugins: [],
};
