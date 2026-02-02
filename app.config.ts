import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",

  ios: {
    bundleIdentifier: "com.anonymous.mobile",
  },

  android: {
    package: "com.anonymous.mobile",
  },

  extra: {},
};

export default config;
