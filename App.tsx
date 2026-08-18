import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MediaImport from './src/MediaImport';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <MediaImport />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' }
});
