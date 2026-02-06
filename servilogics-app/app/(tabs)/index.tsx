import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import type { Service } from '@/../services/ServicesService';
import { getServices } from '@/../services/ServicesService';

export default function HomeScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getServices();
        if (!cancelled) {
          setServices(data.slice(0, 3));
        }
      } catch (e) {
        if (!cancelled) {
          setError('Unable to load featured services');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">RepairPro Services</ThemedText>
      </ThemedView>

      {loading && (
        <ThemedView style={styles.section}>
          <ThemedText>Loading featured services...</ThemedText>
        </ThemedView>
      )}

      {error && !loading && (
        <ThemedView style={styles.section}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      )}

      {!loading && !error && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Popular Services</ThemedText>
          <FlatList
            data={services}
            keyExtractor={(item, index) => item.serviceId || item.id || String(index)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ThemedView style={styles.card}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText>{item.description}</ThemedText>
              </ThemedView>
            )}
          />
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  listContent: {
    gap: 8,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
