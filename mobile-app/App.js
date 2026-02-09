import { StatusBar } from 'expo-status-bar'
import { LogBox, StyleSheet } from 'react-native'
import 'react-native-gesture-handler'
import AppNavigator from './src/navigation/AppNavigator'

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated. Use "boxShadow".',
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
  'Image: style.tintColor is deprecated. Please use props.tintColor.',
  'Animated: `useNativeDriver` is not supported because the native animated module is missing.',
])

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
