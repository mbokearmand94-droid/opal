import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import MediaImport from '../../src/MediaImport';

export default function HomeScreen() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Opal</Text>
        <Button title="Se déconnecter" onPress={() => signOut()} />
      </View>
      <MediaImport />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#a2c2ff', fontSize: 22, fontWeight: '700' }
});
