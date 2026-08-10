import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color ?? colors.forest700, borderColor: color ?? colors.forest700 },
      ]}
    >
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.btnPrimary, (disabled || loading) && { opacity: 0.6 }, pressed && { opacity: 0.85 }]}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnPrimaryText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.7 }]}>
      <Text style={styles.btnSecondaryText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export function CenteredSpinner() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.forest700} />
    </View>
  );
}

export function DifficultyDot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.basalt50 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.basalt200,
    padding: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.basalt300,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.basalt700 },
  btnPrimary: {
    backgroundColor: colors.forest700,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.basalt300,
  },
  btnSecondaryText: { color: colors.basalt800, fontWeight: '600', fontSize: 14 },
  empty: { padding: 32, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.basalt900 },
  emptyMessage: { fontSize: 13, color: colors.basalt600, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
