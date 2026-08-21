import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProjectCard from '../components/ProjectCard';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from '@react-navigation/native';

const PROJECTS_KEY = '@opal_projects';

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(PROJECTS_KEY);
      if (stored) setProjects(JSON.parse(stored));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)).catch(() => {});
  }, [projects]);

  function saveProjects(next: any[]) {
    setProjects(next);
  }

  function createDraft() {
    const project = {
      id: uuidv4(),
      title: `Brouillon - ${new Date().toLocaleString()}`,
      draft: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      media: []
    };
    saveProjects([project, ...projects]);
    navigation.navigate('ProjectDetails' as never, { project } as never);
  }

  function publishProject(id: string) {
    const next = projects.map(p => (p.id === id ? { ...p, draft: false, modifiedAt: new Date().toISOString() } : p));
    saveProjects(next);
  }

  function deleteProject(id: string) {
    Alert.alert('Supprimer', 'Supprimer ce projet ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => saveProjects(projects.filter(p => p.id !== id)) }
    ]);
  }

  const drafts = projects.filter(p => p.draft);
  const published = projects.filter(p => !p.draft);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes projets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={createDraft}><Text style={styles.addText}>Nouveau brouillon</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brouillons</Text>
        {drafts.length === 0 ? <Text style={styles.empty}>Aucun brouillon</Text> : (
          <FlatList
            data={drafts}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <View style={{ marginHorizontal: 16 }}>
                <ProjectCard project={item} onPress={(proj: any) => navigation.navigate('ProjectDetails' as never, { project: proj } as never)} />
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => publishProject(item.id)}><Text style={styles.actionText}>Publier</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff4d4f' }]} onPress={() => deleteProject(item.id)}><Text style={styles.actionText}>Supprimer</Text></TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projets</Text>
        {published.length === 0 ? <Text style={styles.empty}>Aucun projet publié</Text> : (
          <FlatList
            data={published}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <View style={{ marginHorizontal: 16 }}>
                <ProjectCard project={item} onPress={(proj: any) => navigation.navigate('ProjectDetails' as never, { project: proj } as never)} />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#a2c2ff', fontSize: 22, fontWeight: '700' },
  addBtn: { backgroundColor: '#1a73ff', padding: 8, borderRadius: 8 },
  addText: { color: '#fff', fontWeight: '700' },
  section: { marginTop: 8, paddingBottom: 12 },
  sectionTitle: { color: '#dbe6ff', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  empty: { color: '#8f95a8', paddingHorizontal: 16 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, marginBottom: 8 },
  actionBtn: { backgroundColor: '#2e7d32', padding: 8, borderRadius: 8, marginLeft: 8 },
  actionText: { color: '#fff', fontWeight: '700' }
});
