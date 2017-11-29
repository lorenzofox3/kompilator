import node from 'rollup-plugin-node-resolve';

export default {
  input: './src/index.js',
  plugins: [node({jsnext: true})],
  output: {
    file: './dist/index.js',
    format: 'umd'
  },
  sourcemap: true,
  name: 'parser'
};