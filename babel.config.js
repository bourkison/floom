module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'babel-plugin-root-import',
                {
                    rootPathPrefix: '@/',
                    rootPathSuffix: './',
                },
            ],
            'react-native-reanimated/plugin',
        ],
    };
};
