import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { clearProfile, getProfile, saveProfile, type Profile } from '../../lib/profile-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({ name: '', courseYear: '', school: '' });
  const [draft, setDraft] = useState<Profile>({ name: '', courseYear: '', school: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, []),
  );

  function openEditor() {
    setDraft(profile);
    setModalVisible(true);
  }

  async function onSave() {
    if (!draft.name.trim() && !draft.courseYear.trim() && !draft.school.trim()) {
      Alert.alert('Nothing to save', 'Enter your name, course & year, and school first.');
      return;
    }
    setSaving(true);
    await saveProfile(draft);
    setProfile(draft);
    setSaving(false);
    setModalVisible(false);
  }

  async function onClearAccount() {
    setClearing(true);
    await clearProfile();
    setClearing(false);
    setClearModalVisible(false);
    const fresh = await getProfile();
    setProfile(fresh);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={52} color="#1a1a1a" />
      </View>

      <Text style={styles.name}>
        {profile.name || 'Account'}
      </Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#ffd33d" />
          <Text style={styles.infoLabel}>Complete name</Text>
          <Text style={styles.infoValue}>{profile.name || '-'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={18} color="#ffd33d" />
          <Text style={styles.infoLabel}>Course & Year</Text>
          <Text style={styles.infoValue}>{profile.courseYear || '-'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color="#ffd33d" />
          <Text style={styles.infoLabel}>School</Text>
          <Text style={styles.infoValue}>{profile.school || '-'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={openEditor}>
        <Ionicons name="create-outline" size={18} color="#1a1a1a" />
        <Text style={styles.primaryButtonText}>Edit information</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={() => setClearModalVisible(true)}
        disabled={clearing}
      >
        <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
        <Text style={styles.dangerButtonText}>
          {clearing ? 'Clearing...' : 'Clear account'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.version}>ED_QR v1.0.0 - Expo SDK 54</Text>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Ionicons name="person-circle-outline" size={40} color="#ffd33d" />
            <Text style={styles.modalTitle}>Edit information</Text>

            <Text style={styles.inputLabel}>Complete name</Text>
            <TextInput
              style={styles.input}
              value={draft.name}
              onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
              placeholder="Full name"
              placeholderTextColor="#777"
            />

            <Text style={styles.inputLabel}>Course & Year</Text>
            <TextInput
              style={styles.input}
              value={draft.courseYear}
              onChangeText={(courseYear) => setDraft((d) => ({ ...d, courseYear }))}
              placeholder="e.g. BSIT-3E"
              placeholderTextColor="#777"
            />

            <Text style={styles.inputLabel}>School</Text>
            <TextInput
              style={styles.input}
              value={draft.school}
              onChangeText={(school) => setDraft((d) => ({ ...d, school }))}
              placeholder="School name"
              placeholderTextColor="#777"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={clearModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="trash-outline" size={40} color="#ff6b6b" />
            <Text style={styles.modalTitle}>Clear account?</Text>
            <Text style={styles.modalText}>
              Remove your name, course & year, and school? Your scan history will be kept.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, styles.dangerSolidButton]}
              onPress={onClearAccount}
              disabled={clearing}
            >
              <Text style={styles.dangerSolidButtonText}>
                {clearing ? 'Clearing...' : 'Yes, clear account'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setClearModalVisible(false)}
              disabled={clearing}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffd33d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  infoCard: {
    alignSelf: 'stretch',
    backgroundColor: '#1f1f27',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  infoLabel: {
    color: '#999',
    fontSize: 14,
    flex: 0.4,
  },
  infoValue: {
    flex: 0.6,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3a3a42',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  dangerButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    color: '#666',
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1f1a27',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 20,
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#111118',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
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
  modalText: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  dangerSolidButton: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
  },
  dangerSolidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});