// Small update to Home to add navigation to ProjectsList
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import MediaImport from '../../src/MediaImport';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Opal</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Mes projets" onPress={() => navigation.navigate('ProjectsList' as never)} />
          <Button title="Se déconnecter" onPress={() => signOut()} />
        </View>
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
