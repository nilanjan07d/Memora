import { Redirect } from "expo-router";

// The tabs group contains an `index` screen (Home), so without this root route
// Expo Router uses it as the initial screen. Always enter through the welcome
// animation; the user reaches Home only after signing in or registering.
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
