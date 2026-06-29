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
                    dark: '#0f1117',
                    darker: '#090c12',
                    sidebar: '#0d1117',
                    card: '#161b27',
                    border: '#21293d',
                    accent: '#38bdf8',
                    'accent-light': '#7dd3fc',
                    'accent-dim': '#0c4a6e',
                    muted: '#8b98b8',
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
        },
    },
    plugins: [],
};
