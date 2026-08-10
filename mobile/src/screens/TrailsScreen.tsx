import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { api } from '../lib/api';
import { colors } from '../lib/theme';
import {
  ALL_DIFFICULTIES,
  ALL_REGIONS,
  DIFFICULTY_COLOR,
  DIFFICULTY_LABELS,
  REGION_LABELS,
  formatDistance,
  formatDuration,
} from '../lib/format';
import type { Difficulty, Region, TrailCard } from '../lib/types';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Card, Chip, DifficultyDot, EmptyState, CenteredSpinner } from '../components/ui';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Trails'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function TrailsScreen({ navigation }: Props) {
  const [trails, setTrails] = useState<TrailCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ trails: TrailCard[] }>('/trails', {
        query: { difficulty: difficulty ?? undefined, region: region ?? undefined, limit: 40 },
      })
      .then((d) => setTrails(d.trails))
      .catch(() => setTrails([]))
      .finally(() => setLoading(false));
  }, [difficulty, region]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ALL_DIFFICULTIES}
          keyExtractor={(d) => d}
          renderItem={({ item }) => (
            <Chip
              label={DIFFICULTY_LABELS[item]}
              active={difficulty === item}
              color={DIFFICULTY_COLOR[item]}
              onPress={() => setDifficulty(difficulty === item ? null : item)}
            />
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ALL_REGIONS}
          keyExtractor={(r) => r}
          renderItem={({ item }) => (
            <Chip
              label={REGION_LABELS[item]}
              active={region === item}
              onPress={() => setRegion(region === item ? null : item)}
            />
          )}
        />
      </View>

      {loading ? (
        <CenteredSpinner />
      ) : trails.length === 0 ? (
        <EmptyState title="No trails match" message="Clear a filter to see more destinations." />
      ) : (
        <FlatList
          data={trails}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('TrailDetail', { slug: item.slug, name: item.name })}>
              <Card style={{ flexDirection: 'row', gap: 12, padding: 0, overflow: 'hidden' }}>
                {item.coverImage ? (
                  <Image source={{ uri: item.coverImage }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: colors.basalt200 }]} />
                )}
                <View style={{ flex: 1, paddingVertical: 10, paddingRight: 10 }}>
                  <View style={styles.row}>
                    <DifficultyDot color={DIFFICULTY_COLOR[item.difficulty]} />
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.meta}>
                    {REGION_LABELS[item.region]} · {formatDistance(item.distanceKm)} ·{' '}
                    {formatDuration(item.durationMinutes)}
                  </Text>
                  <Text style={styles.summary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.basalt50 },
  filters: { paddingHorizontal: 16, paddingTop: 12, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  thumb: { width: 92, height: '100%', minHeight: 92 },
  name: { fontWeight: '700', color: colors.basalt900, fontSize: 14, flexShrink: 1 },
  meta: { fontSize: 11, color: colors.basalt600, marginTop: 3 },
  summary: { fontSize: 12, color: colors.basalt600, marginTop: 4 },
});
