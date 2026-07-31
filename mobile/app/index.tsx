import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function Index() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href={user.onboarding_done ? '/(tabs)' : '/onboarding'} />;
}
