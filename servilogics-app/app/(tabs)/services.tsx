import { useEffect, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

import type { Service } from '@/../services/ServicesService'
import { getServices } from '@/../services/ServicesService'

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getServices()
        if (!cancelled) {
          setServices(data)
        }
      } catch (e) {
        if (!cancelled) {
          setError('Unable to load services')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading services...</ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Services</ThemedText>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Services</ThemedText>
      <FlatList
        data={services}
        keyExtractor={(item, index) => item.serviceId || item.id || String(index)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText>{item.description}</ThemedText>
            <ThemedText>{`${item.basePrice} ${item.currency}`}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  listContent: {
    paddingVertical: 8,
    gap: 12,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
})
