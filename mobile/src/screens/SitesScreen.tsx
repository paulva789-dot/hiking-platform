import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CAMEROON_SITES } from '../lib/cameroon-sites';
import { ALL_REGIONS, REGION_LABELS } from '../lib/format';
import type { Region } from '../lib/types';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Card, Chip } from '../components/ui';
import { colors } from '../lib/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Sites'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SitesScreen({ navigation }: Props) {
  const [region, setRegion] = useState<Region | null>(null);
  const sites = useMemo(
    () => (region ? CAMEROON_SITES.filter((s) => s.regionKey === region) : CAMEROON_SITES),
    [region]
  );
  const regionsPresent = useMemo(
    () => ALL_REGIONS.filter((r) => CAMEROON_SITES.some((s) => s.regionKey === r)),
    []
  );

  return (
    <View style={styles.root}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={regionsPresent}
        keyExtractor={(r) => r}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <Chip
            label={REGION_LABELS[item]}
            active={region === item}
            onPress={() => setRegion(region === item ? null : item)}
          />
        )}
      />

      <FlatList
        data={sites}
        keyExtractor={(s) => s.slug}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('SiteDetail', { slug: item.slug })}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={{ padding: 12 }}>
                <Text style={styles.region}>
                  {item.region} · {item.elevationM.toLocaleString()} m
                </Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.teaser} numberOfLines={2}>
                  {item.teaser}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.basalt50 },
  filters: { paddingHorizontal: 16, paddingTop: 12 },
  image: { width: '100%', height: 150 },
  region: { fontSize: 11, fontWeight: '700', color: colors.forest700, textTransform: 'uppercase' },
  name: { fontSize: 16, fontWeight: '700', color: colors.basalt900, marginTop: 4 },
  teaser: { fontSize: 13, color: colors.basalt600, marginTop: 4 },
});
