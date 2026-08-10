import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { colors } from '../lib/theme';
import { REGION_LABELS, formatXAF } from '../lib/format';
import type { GuideCard } from '../lib/types';
import { Card, CenteredSpinner, EmptyState } from '../components/ui';

export default function GuidesScreen() {
  const [guides, setGuides] = useState<GuideCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ guides: GuideCard[] }>('/guides', { query: { limit: 40 } })
      .then((d) => setGuides(d.guides))
      .catch(() => setGuides([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CenteredSpinner />;

  return (
    <View style={styles.root}>
      {guides.length === 0 ? (
        <EmptyState
          title="No guides loaded"
          message="Check that the API server is reachable from this device."
        />
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: 'row', gap: 12 }}>
              {item.user.avatarUrl ? (
                <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>
                    {item.user.name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.user.name}</Text>
                <Text style={styles.headline} numberOfLines={2}>
                  {item.headline}
                </Text>
                <Text style={styles.meta}>
                  {item.yearsExperience} yrs · {item.regions.map((r) => REGION_LABELS[r]).join(', ')}
                </Text>
                {item.countries?.some((c) => c !== 'Cameroon') && (
                  <Text style={styles.countries}>Also: {item.countries.filter((c) => c !== 'Cameroon').join(', ')}</Text>
                )}
                <Text style={styles.rate}>{formatXAF(item.dayRateXAF)} / day</Text>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.basalt50 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarFallback: { backgroundColor: colors.forest700, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.white, fontWeight: '700' },
  name: { fontWeight: '700', fontSize: 15, color: colors.basalt900 },
  headline: { fontSize: 12, color: colors.basalt700, marginTop: 2 },
  meta: { fontSize: 11, color: colors.basalt600, marginTop: 4 },
  countries: { fontSize: 11, color: colors.cameroonGreen, marginTop: 2, fontWeight: '600' },
  rate: { fontSize: 13, fontWeight: '700', color: colors.basalt900, marginTop: 4 },
});
