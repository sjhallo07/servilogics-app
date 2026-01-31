import Constants from 'expo-constants'
import { StyleSheet, Text, View } from 'react-native'

export default function DetailsScreen() {
  const extras = Constants.expoConfig?.extra || Constants.manifest?.extra
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
      <Text>expo.extra (some keys):</Text>
      <Text>{JSON.stringify({ API_BASE_URL: extras?.API_BASE_URL, ENABLE_AI_FEATURES: extras?.ENABLE_AI_FEATURES }, null, 2)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
})
