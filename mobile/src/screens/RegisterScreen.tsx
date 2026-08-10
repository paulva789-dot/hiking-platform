import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../lib/auth-context';
import { ApiError } from '../lib/api';
import { colors } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton, SecondaryButton } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await register({ name, email, password });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.label}>Full name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Text style={styles.hint}>At least 8 characters, with an uppercase letter and a number.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ marginTop: 16, gap: 10 }}>
        <PrimaryButton label="Create account" onPress={submit} loading={busy} disabled={!name || !email || !password} />
        <SecondaryButton label="I already have an account" onPress={() => navigation.replace('Login')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.basalt900, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: colors.basalt700, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.basalt300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.basalt900,
  },
  hint: { fontSize: 11, color: colors.basalt500, marginTop: 6 },
  error: { color: colors.laterite700, marginTop: 12, fontSize: 13 },
});
