export default {
    input: 'src/main.js',
    output: {
        file: 'dist/wombat.js',
        format: 'iife',
        globals: {
            jquery: '$'
          }
    },
    external: ['jquery']
};