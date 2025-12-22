module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Note: react-native-reanimated plugin is commented out for Expo Go compatibility
      // Uncomment this when creating a development build:
      // 'react-native-reanimated/plugin',
    ],
  };
};

