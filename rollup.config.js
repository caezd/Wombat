export default {
    input: 'src/main.js',
    output: {
        file: 'dist/switcheroo.js',
        format: 'iife',
        globals: {
            jquery: '$'
          }
    },
    external: ['jquery']
};