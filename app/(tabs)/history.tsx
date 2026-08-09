import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHistory } from '../../lib/history-context';
import type { ScanRecord } from '../../lib/history';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryScreen() {
  const { scans, loading, removeScan, clearAll, refresh } = useHistory();
  const insets = useSafeAreaInsets();
  const [removing, setRemoving] = useState<string | null>(null);
  const [showing, setShowing] = useState<ScanRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function onOpen(record: ScanRecord) {
    if (record.type === 'url') {
      const supported = await Linking.canOpenURL(record.content);
      if (supported) {
        Linking.openURL(record.content);
        return;
      }
      Alert.alert('Cannot open', 'This link could not be opened.');
      return;
    }
    setCopied(false);
    setShowing(record);
  }

  async function onCopy() {
    if (!showing) return;
    await Clipboard.setStringAsync(showing.content);
    setCopied(true);
  }

  function onDelete(record: ScanRecord) {
    Alert.alert('Delete scan', 'Remove this entry from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setRemoving(record.id);
          await removeScan(record.id);
          setRemoving(null);
        },
      },
    ]);
  }

  function onClearAll() {
    Alert.alert('Clear history', 'Delete all scanned links? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center} />;
  }

  if (scans.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="time-outline" size={56} color="#666" />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyText}>
          Scanned QR codes appear here.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.navigate('/qr_code')}>
          <Text style={styles.primaryButtonText}>Go to Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{scans.length} saved</Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowMain} onPress={() => onOpen(item)}>
              <View style={item.type === 'url' ? styles.badge : styles.badgeTextOnly}>
                <Ionicons
                  name={item.type === 'url' ? 'link' : 'document-text'}
                  size={14}
                  color="#1a1a1a"
                />
                <Text style={styles.badgeText}>{item.type === 'url' ? 'URL' : 'TEXT'}</Text>
              </View>
              <Text style={styles.rowLink} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.rowTime}>{timeAgo(item.timestamp)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item)}
              disabled={removing === item.id}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={removing === item.id ? '#666' : '#ff6b6b'}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showing !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="document-text-outline" size={40} color="#ffd33d" />
            <Text style={styles.modalTitle}>QR content</Text>
            <Text style={styles.modalText} selectable>
              {showing?.content}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onCopy}>
              <Text style={styles.primaryButtonText}>
                {copied ? 'Copied!' : 'Copy text'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowing(null)}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  center: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a42',
  },
  count: {
    color: '#aaa',
    fontSize: 13,
  },
  clearText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#1f1f27',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    paddingLeft: 14,
  },
  rowMain: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffd33d',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
    marginBottom: 6,
  },
  badgeTextOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#5b6ee1',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
    marginBottom: 6,
  },
  badgeText: {
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: '700',
  },
  rowLink: {
    color: '#fff',
    fontSize: 14,
  },
  rowTime: {
    color: '#777',
    fontSize: 12,
    marginTop: 6,
  },
  deleteButton: {
    padding: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1f1a27',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  modalText: {
    color: '#ffd33d',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalCancelButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});