const { injectBabelPlugin } = require('react-app-rewired');
//const rewireLess = require('react-app-rewire-less');
const rewireLess = require("react-app-rewire-less-modules");

module.exports = function override(config, env) {

    config = injectBabelPlugin(
        //['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
        ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
        config,
    );
    config = rewireLess.withLoaderOptions({
        modifyVars: {
            //"@primary-color": "#cf1322"
            "@primary-color": "#be0000"
        },
        javascriptEnabled: true,
    })(config, env);

    return config;
};