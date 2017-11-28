import node from 'rollup-plugin-node-resolve';

export default {
  input: './test/index.js',
  plugins: [node({jsnext: true})],
  output: {
    file: './test/dist/index.js',
    format: 'iife'
  },
  sourcemap: true,
  name: 'test'
};