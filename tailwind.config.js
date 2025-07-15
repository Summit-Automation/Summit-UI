// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            colors: {
                // your “deep slate” primary
                primary: {
                    DEFAULT: '#0f172a',      // slate-950
                    50:  '#f8fafc',
                    100: '#f1f5f9',
                    // …
                    900: '#0f172a',
                },
                surface: {
                    DEFAULT: 'rgba(15,23,42,0.7)', // semi-opaque backdrop
                },
                border: 'rgba(100,116,139,0.4)',  // slate-600/40
                icon: 'rgb(148,163,184)',         // slate-400
            },
            borderRadius: { xl: '1.5rem' },
            boxShadow: {
                premium: '0 20px 40px -10px rgba(0,0,0,0.5)',
            },
        },
    },
};
