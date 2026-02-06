import Constants from 'expo-constants';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/themed-view';

const getWebAppUrl = () => {
  const extra = Constants.expoConfig?.extra as { WEB_APP_URL?: string } | undefined;
  return extra?.WEB_APP_URL ?? 'http://192.168.100.82:5175';
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const webAppUrl = getWebAppUrl();

  return (
    <ThemedView style={styles.container}>
      <WebView
        source={{ uri: webAppUrl }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      {loading && (
        <ThemedView style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
