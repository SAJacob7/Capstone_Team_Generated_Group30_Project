module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',      // import from '@env'
          path: '.env',            // path to your .env file
          safe: false,             // set true if you have a .env.example
          allowUndefined: true,    // don’t throw if some variables are missing
        },
      ],
    ],
  };
};
