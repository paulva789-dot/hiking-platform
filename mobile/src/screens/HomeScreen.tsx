import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { api } from '../lib/api';
import { colors } from '../lib/theme';
import { DIFFICULTY_COLOR, formatDistance, formatDuration } from '../lib/format';
import type { TrailCard } from '../lib/types';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Card, CenteredSpinner, DifficultyDot } from '../components/ui';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WHAT_HIKING_ENTAILS = [
  {
    title: 'A route, on foot, outdoors',
    body: 'Forest trails, volcanic slopes, savanna tracks or a coastal path — easy routes run under 4 hours; summit attempts can run several days.',
  },
  {
    title: 'Ordinary fitness, honestly rated',
    body: 'No special athleticism for an Easy or Moderate trail. Hard and Expert routes need real preparation — build up to them.',
  },
  {
    title: 'The right gear, not lots of it',
    body: 'Boots, water, a rain layer and a charged phone cover most day hikes. The full checklist is on the Safety page on the web.',
  },
  {
    title: 'Usually with a local guide',
    body: 'Registered guides handle route-finding, weather calls and permits — required outright on some trails, advised on the rest.',
  },
];

export default function HomeScreen({ navigation }: Props) {
  const [trails, setTrails] = useState<TrailCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ trails: TrailCard[] }>('/trails', { query: { sort: 'popular', limit: 6 } })
      .then((d) => setTrails(d.trails))
      .catch(() => setTrails([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.hero}>
        <Text style={styles.heroBadge}>ALL TEN REGIONS OF CAMEROON</Text>
        <Text style={styles.heroTitle}>Hiking in Cameroon, with the information you actually need</Text>
        <Text style={styles.heroBody}>
          Real distances and durations, difficulty ratings that mean something, and registered local
          guides you can book directly — now across Cameroon and the wider CEMAC region.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>NEW TO THIS?</Text>
        <Text style={styles.sectionTitle}>What hiking actually is, and what it takes</Text>
        {WHAT_HIKING_ENTAILS.map((item) => (
          <Card key={item.title} style={{ marginTop: 10 }}>
            <Text style={styles.entailTitle}>{item.title}</Text>
            <Text style={styles.entailBody}>{item.body}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where people are hiking</Text>
        {loading ? (
          <CenteredSpinner />
        ) : (
          <FlatList
            data={trails}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(t) => t.id}
            contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('TrailDetail', { slug: item.slug, name: item.name })}>
                <Card style={styles.trailCard}>
                  {item.coverImage && <Image source={{ uri: item.coverImage }} style={styles.trailImage} />}
                  <View style={{ padding: 10 }}>
                    <View style={styles.row}>
                      <DifficultyDot color={DIFFICULTY_COLOR[item.difficulty]} />
                      <Text style={styles.trailName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={styles.trailMeta}>
                      {formatDistance(item.distanceKm)} · {formatDuration(item.durationMinutes)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.basalt50 },
  hero: { backgroundColor: colors.forest950, padding: 20, paddingTop: 24, paddingBottom: 28 },
  heroBadge: { color: colors.forest100, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '700', lineHeight: 32 },
  heroBody: { color: colors.basalt300, marginTop: 10, fontSize: 14, lineHeight: 20 },
  section: { padding: 20 },
  sectionEyebrow: { fontSize: 11, fontWeight: '700', color: colors.forest700, letterSpacing: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.basalt900, marginTop: 4, marginBottom: 4 },
  entailTitle: { fontSize: 14, fontWeight: '700', color: colors.basalt900 },
  entailBody: { fontSize: 13, color: colors.basalt600, marginTop: 4, lineHeight: 18 },
  trailCard: { width: 220, overflow: 'hidden', padding: 0 },
  trailImage: { width: '100%', height: 110 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trailName: { fontWeight: '700', color: colors.basalt900, fontSize: 14, flexShrink: 1 },
  trailMeta: { fontSize: 12, color: colors.basalt500, marginTop: 4 },
});
