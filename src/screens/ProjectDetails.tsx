import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProjectDetails({ route }: any) {
  const project = route?.params?.project;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{project?.title || 'Projet'}</Text>
      <Text style={styles.meta}>Template: {project?.templateId || '—'}</Text>
      <Text style={styles.meta}>Créé: {project?.createdAt ? new Date(project.createdAt).toLocaleString() : '—'}</Text>
      <Text style={styles.meta}>Modifié: {project?.modifiedAt ? new Date(project.modifiedAt).toLocaleString() : '—'}</Text>
      <View style={{ height: 12 }} />
      <Text style={{ color: '#ddd' }}>Éditeur à venir — pour l'instant tu peux importer des médias depuis l'écran principal.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0b0d' },
  title: { color: '#a2c2ff', fontSize: 22, fontWeight: '700' },
  meta: { color: '#bfc7ff', marginTop: 6 }
});
