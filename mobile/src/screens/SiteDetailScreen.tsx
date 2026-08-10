import { useEffect } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CAMEROON_SITES } from '../lib/cameroon-sites';
import { colors } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton, SecondaryButton } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteDetail'>;

export default function SiteDetailScreen({ route, navigation }: Props) {
  const site = CAMEROON_SITES.find((s) => s.slug === route.params.slug);

  useEffect(() => {
    if (site) navigation.setOptions({ title: site.name });
  }, [site, navigation]);

  if (!site) {
    return (
      <View style={styles.centered}>
        <Text>Site not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <Image source={{ uri: site.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.region}>
          {site.region} · {site.elevationM.toLocaleString()} m elevation
        </Text>
        <Text style={styles.title}>{site.name}</Text>

        <Text style={styles.sectionTitle}>History</Text>
        <Text style={styles.paragraph}>{site.history}</Text>

        <Text style={styles.sectionTitle}>Culture & traditions</Text>
        <Text style={styles.paragraph}>{site.culture}</Text>

        <View style={{ marginTop: 16, gap: 10 }}>
          <PrimaryButton
            label="Open in Maps"
            onPress={() =>
              Linking.openURL(`https://www.openstreetmap.org/?mlat=${site.lat}&mlon=${site.lng}#map=13/${site.lat}/${site.lng}`)
            }
          />
          <SecondaryButton label="Read more on Wikipedia" onPress={() => Linking.openURL(site.wikipediaUrl)} />
        </View>

        <Text style={styles.credit}>Photo: {site.imageCredit}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 220 },
  body: { padding: 20 },
  region: { fontSize: 11, fontWeight: '700', color: colors.forest700, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', color: colors.basalt900, marginTop: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.basalt400, textTransform: 'uppercase', marginTop: 16 },
  paragraph: { fontSize: 14, lineHeight: 21, color: colors.basalt700, marginTop: 6 },
  credit: { fontSize: 11, color: colors.basalt400, marginTop: 20 },
});
