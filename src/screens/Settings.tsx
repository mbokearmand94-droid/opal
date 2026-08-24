import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const SETTINGS_KEY = '@opal_settings';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [autoUpload, setAutoUpload] = useState(false);
  const [syncOverWifiOnly, setSyncOverWifiOnly] = useState(true);
  const [apiBase, setApiBase] = useState('http://localhost:3000');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setAutoUpload(!!s.autoUpload);
          setSyncOverWifiOnly(!!s.syncOverWifiOnly);
          setApiBase(s.apiBase || apiBase);
        }
      } catch (e) {
        console.error('Load settings', e);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const s = { autoUpload, syncOverWifiOnly, apiBase };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      Alert.alert('Paramètres sauvegardés');
    } catch (e) {
      console.error('Save settings', e);
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setSaving(false);
    }
  }

  async function clearLocalData() {
    Alert.alert('Confirmer', 'Supprimer les projets locaux et médias enregistrés ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('@opal_projects');
            await AsyncStorage.removeItem('@opal_media');
            Alert.alert('Terminé', 'Données locales supprimées');
          } catch (e) {
            console.error('Clear data', e);
            Alert.alert('Erreur', 'Impossible de supprimer les données locales');
          }
        }
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Upload automatique</Text>
        <Switch value={autoUpload} onValueChange={setAutoUpload} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Synchroniser seulement sur Wi‑Fi</Text>
        <Switch value={syncOverWifiOnly} onValueChange={setSyncOverWifiOnly} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>API backend</Text>
        <TextInput value={apiBase} onChangeText={setApiBase} style={styles.input} autoCapitalize="none" />
      </View>

      <View style={{ height: 12 }} />
      <Button title={saving ? 'Sauvegarde...' : 'Sauvegarder'} onPress={save} />

      <View style={{ height: 12 }} />
      <Button title="Supprimer les données locales" color="#ff4d4f" onPress={clearLocalData} />

      <View style={{ height: 12 }} />
      <Button title="Se déconnecter" onPress={() => signOut()} />

      <View style={{ height: 20 }} />
      <Text style={styles.note}>Les paramètres sont stockés localement. En production, certains paramètres (API, tokens) devraient être gérés côté serveur.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0b0d' },
  title: { color: '#a2c2ff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { color: '#dbe6ff', fontSize: 16 },
  field: { marginBottom: 12 },
  input: { backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginTop: 6 },
  note: { color: '#8f95a8', fontSize: 12 }
});
