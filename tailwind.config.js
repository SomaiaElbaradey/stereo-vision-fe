/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                red: {
                    800: "#8B0000",
                    900: "#660000",
                },
                amber: {
                    600: "#DAA520",
                },
            },
        },
    },
    plugins: [],
    // This ensures Tailwind doesn't override Ant Design styles unexpectedly
    corePlugins: {
        preflight: false,
    },
};
