import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <Ionicons name="help-circle-outline" size={56} color="#666" />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>
          The page you are looking for does not exist.
        </Text>
        <Link href="/" style={styles.button}>
          Go back to Home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  button: {
    fontSize: 17,
    textDecorationLine: 'underline',
    color: '#ffd33d',
  },
});