import Constants from 'expo-constants';
import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/themed-view';

const getWebAppUrl = () =>
{
  const extra = Constants.expoConfig?.extra as { WEB_APP_URL?: string } | undefined;
  return extra?.WEB_APP_URL ?? 'http://10.0.13.106:5173';
};

export default function HomeScreen()
{
  const [loading, setLoading] = useState(true);
  const webAppUrl = getWebAppUrl();

  // Use iframe for web, WebView for native
  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.container}>
        <iframe
          src={webAppUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <ThemedView style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
          </ThemedView>
        )}
      </ThemedView>
    );
  }

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
