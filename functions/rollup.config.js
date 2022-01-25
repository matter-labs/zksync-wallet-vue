import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';

/**
 * Add here external dependencies that actually you use.
 */
const externals = [
  'cors',
  'firebase-functions',
  'firebase-admin',
];

export default {
  input: 'src/index.ts',
  external: externals,
  plugins: [
    typescript(),
    nodeResolve()
  ],
  onwarn: () => { return  },
  output: {
    file: 'lib/index.js',
    format: 'es',
    sourcemap: false
  }
}