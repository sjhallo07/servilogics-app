import Constants from 'expo-constants'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native'
import { getHealth } from '../../services/api'

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setLoading(true)
    getHealth()
      .then((res) => setStatus(res))
      .catch((e) => setStatus({ error: e.message }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RepairPro Mobile</Text>
      <Text>API_BASE_URL: {Constants.expoConfig?.extra?.API_BASE_URL}</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <View style={{ marginTop: 12 }}>
          <Text>Backend status:</Text>
          <Text>{status ? JSON.stringify(status) : 'no status'}</Text>
        </View>
      )}
      <View style={{ marginTop: 20 }}>
        <Button title="Open details" onPress={() => navigation.navigate('Details')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
})
