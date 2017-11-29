import node from 'rollup-plugin-node-resolve';

export default {
  input: './example/index.js',
  plugins: [node({jsnext: true})],
  output: {
    file: './example/dist/index.js',
    format: 'iife'
  },
  sourcemap: true,
  name: 'test'
};