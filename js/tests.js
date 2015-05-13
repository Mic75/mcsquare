require.config({
  paths: {
    'QUnit': 'libs/qunit/qunit/qunit',
    jquery: 'libs/jquery/dist/jquery',
    threejs: "libs/threejs/build/three",
    objloader: "libs/threejs/build/OBJLoader"
  },
  shim: {
    'QUnit': {
      exports: 'QUnit',
      init: function () {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    },
    "threejs" : {
      exports: "THREE"
    },
    objloader: {
      deps: ['threejs']      
    }
  }
});

// require the unit tests.
require(
        ['QUnit', 'tests/square_tests'],
        function (QUnit, SquareTest) {
          // run the tests.
          SquareTest.run();
          // start QUnit.
          QUnit.load();
          QUnit.start();
        }
);