// import AppleHealthKit from "react-native-health";

// const permissions = {
//   permissions: {
//     read: [
//       AppleHealthKit.Constants.Permissions.Steps,
//       AppleHealthKit.Constants.Permissions.HeartRate,
//       AppleHealthKit.Constants.Permissions.SleepAnalysis,
//       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
//     ],
//     write: [
//       AppleHealthKit.Constants.Permissions.Workout,
//       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
//     ],
//   },
// };

// export const requestAppleHealth = () => {
//   return new Promise((resolve, reject) => {
//     AppleHealthKit.initHealthKit(permissions, (err) => {
//       if (err) {
//         console.log("❌ HealthKit init error:", err);
//         reject(err);
//         return;
//       }

//       console.log("✅ HealthKit connected");
//       resolve(true);
//     });
//   });
// };
