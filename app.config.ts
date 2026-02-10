import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",

  ios: {
    bundleIdentifier: "com.anonymous.mobile",
    userInterfaceStyle: "dark",
  },

  android: {
    package: "com.anonymous.mobile",
  },

  plugins: [
  
    "expo-notifications"
  ],
};

export default config;
