import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { useHistory } from '../../lib/history-context';
import {
  classifyContentKind,
  isValidTarget,
  normalizeTarget,
  searchQuery,
  type ContentKind,
} from '../../lib/scan-utils';

type ScanResult = {
  content: string;
  kind: ContentKind;
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const { addScan } = useHistory();

  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [stopped, setStopped] = useState(false);
  const lockedRef = useRef(false);

async function handleScanned(scanned: BarcodeScanningResult) {
    if (!isFocused || lockedRef.current) return;
    lockedRef.current = true;

    const content = scanned.data.trim();
    addScan(content);
    setResult({
      content,
      kind: classifyContentKind(content),
    });

    await openInBrowser(content);
  }

  function getOpenTarget(content: string): string {
    return isValidTarget(content)
      ? normalizeTarget(content)
      : searchQuery(content);
  }

  async function openInBrowser(content: string) {
    const target = getOpenTarget(content);
    if (!target) {
      Alert.alert('Cannot open', 'No valid link or search target was found.');
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(target);
    } catch {
      try {
        await Linking.openURL(target);
      } catch {
        Alert.alert(
          'Cannot open',
          'Opening failed. Please try opening this link in your browser manually.',
        );
      }
    }
  }

  function resetScan() {
    setResult(null);
    setStopped(false);
    setTorch(false);
    lockedRef.current = false;
  }

  function stopScan() {
    setResult(null);
    setStopped(true);
    setTorch(false);
    lockedRef.current = true;
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={48} color="#ffd33d" />
          <Text style={styles.permissionTitle}>Camera permission needed</Text>
          <Text style={styles.permissionText}>
            ED_QR needs access to your camera to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Allow camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && !result && !stopped ? (
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScanned}
        />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      <View style={styles.overlay}>
        <View style={styles.overlayBox}>
          <Ionicons
            name={stopped ? 'stop-circle-outline' : 'scan-outline'}
            size={40}
            color={stopped ? '#ff6b6b' : 'rgba(255,255,255,0.9)'}
          />
          <Text style={styles.overlayText}>
            {stopped ? 'Scanning stopped' : 'Point the camera at a QR code'}
          </Text>
        </View>

        {stopped ? (
          <TouchableOpacity style={styles.startButton} onPress={resetScan}>
            <Ionicons name="play" size={20} color="#1a1a1a" />
            <Text style={styles.startButtonText}>Start scanning</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.torchRow}>
            <TouchableOpacity
              style={[styles.iconButton, torch && styles.iconButtonActive]}
              onPress={() => setTorch((t) => !t)}
            >
              <Ionicons
                name={torch ? 'flash' : 'flash-off-outline'}
                size={22}
                color="#fff"
              />
              <Text style={styles.iconButtonLabel}>Flash</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={result !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons
              name={result?.kind !== 'text' ? 'link-outline' : 'document-text-outline'}
              size={44}
              color="#ffd33d"
            />
            <Text style={styles.modalTitle}>
              {result?.kind === 'text'
                ? 'Text detected'
                : result?.kind === 'ip'
                  ? 'Address detected'
                  : 'Link detected'}
            </Text>
            <Text style={styles.modalLink} numberOfLines={4} selectable>
              {result?.content}
            </Text>

            {result?.kind === 'text' ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => result && openInBrowser(result.content)}
              >
                <Text style={styles.primaryButtonText}>Search Google</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => result && openInBrowser(result.content)}
              >
                <Text style={styles.primaryButtonText}>Open link</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={resetScan}>
              <Text style={styles.secondaryButtonText}>Scan again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={stopScan}>
              <Ionicons name="close-circle-outline" size={18} color="#aaa" />
              <Text style={styles.cancelButtonText}>Cancel - stop scanning</Text>
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
    padding: 24,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#0f0f12',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
  },
  overlayBox: {
    backgroundColor: 'rgba(18,18,22,0.92)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: '85%',
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  torchRow: {
    marginTop: 20,
  },
  iconButton: {
    backgroundColor: 'rgba(28,28,36,0.9)',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButtonActive: {
    backgroundColor: '#ffd33d',
  },
  iconButtonLabel: {
    color: '#fff',
    fontSize: 13,
  },
  permissionCard: {
    backgroundColor: '#1f1f27',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  permissionText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
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
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  modalLink: {
    color: '#ffd33d',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 18,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffd33d',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  startButtonText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
  },
});