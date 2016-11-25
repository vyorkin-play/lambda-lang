import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import flow from 'rollup-plugin-flow';
import visualizer from 'rollup-plugin-visualizer';

export default {
  entry: 'src/index.js',
  dest: 'dist/bundle.js',
  plugins: [
    nodeResolve({ jsnext: true }),
    commonjs({ include: 'node_modules/**' }),
    eslint({ include: 'src/**' }),
    flow({ include: 'src/**' }),
    babel({ exclude: 'node_modules/**' }),
    visualizer({ filename: 'dist/stats.html' }),
  ],
};
