export default {
    input: 'src/main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        globals: {
            jquery: '$'
          }
    },
    external: ['jquery']
};