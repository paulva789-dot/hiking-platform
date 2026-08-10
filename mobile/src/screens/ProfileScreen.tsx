import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '../lib/auth-context';
import { colors } from '../lib/theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { CenteredSpinner, PrimaryButton, SecondaryButton } from '../components/ui';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, loading, isPremium, logout } = useAuth();

  if (loading) return <CenteredSpinner />;

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>You're browsing as a guest</Text>
        <Text style={styles.subtitle}>Sign in to save trails, book guides and track your bookings.</Text>
        <View style={{ marginTop: 20, gap: 10, width: '100%' }}>
          <PrimaryButton label="Sign in" onPress={() => navigation.navigate('Login')} />
          <SecondaryButton label="Create an account" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitials}>
          {user.name
            .split(' ')
            .slice(0, 2)
            .map((p) => p[0])
            .join('')}
        </Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      {isPremium && <Text style={styles.premium}>Premium member</Text>}

      <View style={{ marginTop: 24, width: '100%' }}>
        <SecondaryButton label="Sign out" onPress={() => void logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: 24, alignItems: 'center', paddingTop: 60 },
  centered: { flex: 1, backgroundColor: colors.white, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.basalt900, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.basalt600, textAlign: 'center', marginTop: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.forest700, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.white, fontWeight: '700', fontSize: 22 },
  name: { fontSize: 18, fontWeight: '700', color: colors.basalt900, marginTop: 12 },
  email: { fontSize: 13, color: colors.basalt600, marginTop: 2 },
  premium: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
