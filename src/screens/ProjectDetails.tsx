import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = '@opal_projects';

export default function ProjectDetails({ route, navigation }: any) {
  const project = route?.params?.project;

  async function toggleDraft() {
    try {
      const stored = await AsyncStorage.getItem(PROJECTS_KEY);
      const projects = stored ? JSON.parse(stored) : [];
      const next = projects.map((p: any) => (p.id === project.id ? { ...p, draft: !p.draft, modifiedAt: new Date().toISOString() } : p));
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{project?.title || 'Projet'}</Text>
      <Text style={styles.meta}>Template: {project?.templateId || '—'}</Text>
      <Text style={styles.meta}>Créé: {project?.createdAt ? new Date(project.createdAt).toLocaleString() : '—'}</Text>
      <Text style={styles.meta}>Modifié: {project?.modifiedAt ? new Date(project.modifiedAt).toLocaleString() : '—'}</Text>
      <View style={{ height: 12 }} />
      <Text style={{ color: '#ddd' }}>Éditeur à venir — pour l'instant tu peux importer des médias depuis l'écran principal.</Text>
      <View style={{ height: 18 }} />
      <Button title={project?.draft ? 'Publier le projet' : 'Placer en brouillon'} onPress={toggleDraft} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0b0d' },
  title: { color: '#a2c2ff', fontSize: 22, fontWeight: '700' },
  meta: { color: '#bfc7ff', marginTop: 6 }
});
