import { Redirect } from 'expo-router';

/** True child path is family code → name → PIN, with no parent email on this device. */
export default function ChildDeviceSetupScreen() {
  return <Redirect href="/(auth)/child-entry" />;
}
