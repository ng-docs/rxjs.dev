module.exports = function (wallaby) {
  return ({
    files: [
      'tsconfig.base.json',
      'tsconfig.json',
      'src/**/*.ts',
      { pattern: 'spec/helpers/!(*-spec).ts', instrument: false, load: true }
    ],

    tests: ['spec/**/*-spec.ts'],

    testFramework: {
      type: 'mocha',
      path: 'mocha'
    },

    env: {
      type: 'node'
    },

    workers: { initial: 2, regular: 1 },

    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        module: 'commonjs',
        target: 'esnext'
      })
    },

    setup: function (w) {
      if (!global._tsconfigPathsRegistered) {
        var tsConfigPaths = require('tsconfig-paths');
        tsConfigPaths.register();
        global._tsconfigPathsRegistered = true;
      }

      // Global test helpers
      global.mocha = require('mocha');
      global.Suite = global.mocha.Suite;
      global.Test = global.mocha.Test;

      //delete global context due to avoid issue by reusing process
      //https://github.com/wallabyjs/public/issues/536
      if (global.asDiagram) {
        delete global.asDiagram;
      }

      var mocha = wallaby.testFramework;
      var path = require('path');
      require(path.resolve(w.projectCacheDir, 'spec/helpers/setup'));
      mocha.ui(path.resolve(w.projectCacheDir, 'spec/helpers/testScheduler-ui'));
    }
  });
};
