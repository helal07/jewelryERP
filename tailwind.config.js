import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    50: '#f0f5ff',
                    100: '#e5edff',
                    200: '#cddbfe',
                    300: '#a4bcfc',
                    400: '#7692fa',
                    500: '#5264f6',
                    600: '#3c42eb',
                    700: '#3232d0',
                    800: '#2a2ba8',
                    900: '#272985',
                    950: '#17174e',
                },
                accent: {
                    gold: '#D4AF37',
                    silver: '#C0C0C0',
                    rose: '#B76E79',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },

    plugins: [forms],
};
