import { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../lib/api';
import { colors } from '../lib/theme';
import { DIFFICULTY_COLOR, DIFFICULTY_LABELS, REGION_LABELS, formatDistance, formatDuration } from '../lib/format';
import type { Trail } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { CenteredSpinner, DifficultyDot, PrimaryButton } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'TrailDetail'>;

export default function TrailDetailScreen({ route, navigation }: Props) {
  const { slug, name } = route.params;
  const [trail, setTrail] = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: name });
    api
      .get<{ trail: Trail }>(`/trails/${slug}`)
      .then((d) => setTrail(d.trail))
      .catch(() => setTrail(null))
      .finally(() => setLoading(false));
  }, [slug, name, navigation]);

  if (loading) return <CenteredSpinner />;
  if (!trail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load this trail. Check the API is reachable.</Text>
      </View>
    );
  }

  const openInMaps = () => {
    const label = encodeURIComponent(trail.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${trail.startLat},${trail.startLng}`,
      android: `geo:0,0?q=${trail.startLat},${trail.startLng}(${label})`,
      default: `https://www.openstreetmap.org/?mlat=${trail.startLat}&mlon=${trail.startLng}#map=14/${trail.startLat}/${trail.startLng}`,
    });
    if (url) Linking.openURL(url);
  };

  const mapHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>body,html,#m{margin:0;padding:0;height:100%}</style></head>
    <body><iframe id="m" width="100%" height="100%" frameborder="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${trail.startLng - 0.05}%2C${trail.startLat - 0.05}%2C${trail.startLng + 0.05}%2C${trail.startLat + 0.05}&layer=mapnik&marker=${trail.startLat}%2C${trail.startLng}"></iframe>
    </body></html>`;

  return (
    <ScrollView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.row}>
          <DifficultyDot color={DIFFICULTY_COLOR[trail.difficulty]} />
          <Text style={styles.difficulty}>{DIFFICULTY_LABELS[trail.difficulty]}</Text>
          <Text style={styles.metaSep}>·</Text>
          <Text style={styles.region}>{REGION_LABELS[trail.region]}</Text>
        </View>
        <Text style={styles.title}>{trail.name}</Text>
        <Text style={styles.stats}>
          {formatDistance(trail.distanceKm)} · {formatDuration(trail.durationMinutes)} · +
          {trail.elevationGainM.toLocaleString()} m gain
          {trail.summitM ? ` · summit ${trail.summitM.toLocaleString()} m` : ''}
        </Text>
      </View>

      <Text style={styles.description}>{trail.description}</Text>

      {trail.permitRequired && (
        <View style={styles.permitBanner}>
          <Text style={styles.permitText}>A permit is required for this trail.</Text>
          {trail.permitInfo && <Text style={styles.permitSub}>{trail.permitInfo}</Text>}
        </View>
      )}

      {trail.hazards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hazards</Text>
          {trail.hazards.map((h) => (
            <Text key={h} style={styles.listItem}>
              • {h}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start point</Text>
        <View style={styles.mapWrap}>
          <WebView source={{ html: mapHtml }} style={{ flex: 1 }} />
        </View>
        <View style={{ marginTop: 10 }}>
          <PrimaryButton label="Open in Maps app" onPress={openInMaps} />
        </View>
      </View>

      {trail.waypoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waypoints</Text>
          {trail.waypoints.map((wp, i) => (
            <View key={wp.id} style={styles.waypoint}>
              <Text style={styles.waypointName}>
                {i + 1}. {wp.name}
                {wp.elevationM ? ` — ${wp.elevationM.toLocaleString()} m` : ''}
              </Text>
              {wp.description && <Text style={styles.waypointDesc}>{wp.description}</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: colors.basalt600, textAlign: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: colors.basalt100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  difficulty: { fontSize: 11, fontWeight: '700', color: colors.basalt700, textTransform: 'uppercase' },
  metaSep: { color: colors.basalt400 },
  region: { fontSize: 11, fontWeight: '600', color: colors.basalt600 },
  title: { fontSize: 24, fontWeight: '700', color: colors.basalt900, marginTop: 6 },
  stats: { fontSize: 13, color: colors.basalt600, marginTop: 6 },
  description: { fontSize: 14, lineHeight: 21, color: colors.basalt700, padding: 20 },
  permitBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#faf5f7',
    borderWidth: 1,
    borderColor: colors.plum600,
  },
  permitText: { fontWeight: '700', color: colors.plum700, fontSize: 13 },
  permitSub: { fontSize: 12, color: colors.basalt600, marginTop: 4 },
  section: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.basalt900, marginBottom: 8 },
  listItem: { fontSize: 13, color: colors.basalt700, marginBottom: 4 },
  mapWrap: { height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.basalt200 },
  waypoint: { marginBottom: 10 },
  waypointName: { fontSize: 13, fontWeight: '600', color: colors.basalt800 },
  waypointDesc: { fontSize: 12, color: colors.basalt600, marginTop: 2 },
});
