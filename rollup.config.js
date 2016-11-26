import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import visualizer from 'rollup-plugin-visualizer';

const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies);

export default {
  entry: 'src/index.js',
  external,
  plugins: [
    nodeResolve({ jsnext: true }),
    commonjs({ include: 'node_modules/**' }),
    eslint({ include: 'src/**' }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        'es2015-rollup',
        'stage-0',
      ],
      plugins: [
        'transform-flow-strip-types',
      ],
    }),
    visualizer({ filename: 'dist/stats.html' }),
  ],
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'lambdaLang',
      sourceMap: true,
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es',
      sourceMap: true,
    },
  ],
};
