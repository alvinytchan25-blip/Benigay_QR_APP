import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHistory } from '../../lib/history-context';

function isImageUrl(content: string): boolean {
  return /^https?:\/\/.+(\.(png|jpe?g|gif|webp|heic|avif|bmp|svg))(\?.*)?$/i.test(
    content.trim(),
  );
}

function AppButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.appButton} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={18} color="#1a1a1a" /> : null}
      <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const { addScan } = useHistory();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Needed</Text>
        <Text style={styles.subtitle}>
          We need access to your camera to scan QR codes.
        </Text>
        <AppButton
          title="Grant Permission"
          icon="camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    const content = data.trim();
    setScanned(true);
    setLastData(content);
    addScan(content);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {scanned ? 'QR Code detected!' : 'Point your camera at a QR code'}
        </Text>

        {scanned && lastData && isImageUrl(lastData) && (
          <Image
            source={lastData}
            style={styles.previewImage}
            contentFit="contain"
          />
        )}

        {scanned && lastData && (
          <Text style={styles.scanResult} numberOfLines={3}>
            {lastData}
          </Text>
        )}

        {scanned && (
          <AppButton
            title="Scan Again"
            icon="refresh"
            onPress={() => setScanned(false)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  overlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 60,
    backgroundColor: '#1f1f27',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#0f0f12',
  },
  scanResult: {
    fontSize: 14,
    color: '#ffd33d',
    textAlign: 'center',
    marginBottom: 12,
  },
  appButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  appButtonText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});