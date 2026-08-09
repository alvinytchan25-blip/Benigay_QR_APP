import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHistory } from '../../lib/history-context';
import { getProfile } from '../../lib/profile-storage';

export default function Index() {
  const insets = useSafeAreaInsets();
  const { scans } = useHistory();
  const [name, setName] = useState('');

  useEffect(() => {
    getProfile().then((p) => setName(p.name));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Ionicons name="qr-code" size={42} color="#1a1a1a" />
        </View>
        <View>
          <Text style={styles.brandName}>ED_QR</Text>
          <Text style={styles.brandTagline}>Scan and read any QR code</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{scans.length}</Text>
          <Text style={styles.statLabel}>QR codes scanned</Text>
        </View>
      </View>

      <Text style={styles.greeting}>
        {name ? `Welcome ${name}!` : 'Welcome!'}
      </Text>
<Text style={styles.subGreeting}>
        Point your camera at an expo QR code to detect and read what it contains.
      </Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.navigate('/qr_code')}
      >
        <Ionicons name="scan" size={22} color="#1a1a1a" />
        <Text style={styles.scanButtonText}>Start scanning</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.navigate('/history')}
      >
        <Ionicons name="time-outline" size={22} color="#fff" />
        <Text style={styles.historyButtonText}>View history</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Developed by Albin Benigay | BSIT-3E
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    paddingHorizontal: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#ffd33d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  brandTagline: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 28,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1f1f27',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  statValue: {
    color: '#ffd33d',
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 30,
  },
  subGreeting: {
    color: '#999',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffd33d',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 32,
  },
  scanButtonText: {
    color: '#1a1a1a',
    fontSize: 17,
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1f1f27',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3a3a42',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 12,
  },
});