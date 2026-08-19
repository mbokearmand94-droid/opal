import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TemplateCard from '../components/TemplateCard';
import ProjectCard from '../components/ProjectCard';
import MediaImport from '../MediaImport';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

const TEMPLATES = [
  { id: 'tpl1', title: 'Vlog court', description: 'Intro + clip principal + outro', thumbnail: '' },
  { id: 'tpl2', title: 'Réel/Short', description: 'Format vertical, cuts rapides', thumbnail: '' },
  { id: 'tpl3', title: 'Montage musique', description: 'Cuts & transitions rythmées', thumbnail: '' }
];

const PROJECTS_KEY = '@opal_projects';

export default function HomeScreen() {
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

  function openTemplate(template: any) {
    // Create a new project from template
    const project = {
      id: uuidv4(),
      title: `Nouveau - ${template.title}`,
      templateId: template.id,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      media: []
    };
    setProjects(prev => [project, ...prev]);
    // Navigate to project details (not fully implemented yet)
    navigation.navigate('ProjectDetails' as never, { project } as never);
  }

  function openProject(project: any) {
    navigation.navigate('ProjectDetails' as never, { project } as never);
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Templates</Text>
        <FlatList
          horizontal
          data={TEMPLATES}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <TemplateCard template={item} onPress={openTemplate} />}
          contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projets récents</Text>
        {projects.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={styles.empty}>Aucun projet. Crée un projet depuis un template ou importe des médias.</Text>
            <TouchableOpacity style={styles.cta} onPress={() => Alert.alert('Créer un projet', 'Sélectionne un template ci-dessus pour démarrer.') }>
              <Text style={styles.ctaText}>Comment démarrer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={p => p.id}
            renderItem={({ item }) => <ProjectCard project={item} onPress={openProject} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          />
        )}
      </View>

      <View style={styles.divider} />
      <MediaImport />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  section: { marginTop: 8 },
  sectionTitle: { color: '#dbe6ff', fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  empty: { color: '#8f95a8' },
  cta: { marginTop: 10, backgroundColor: '#1a73ff', padding: 10, borderRadius: 8, alignSelf: 'flex-start' },
  ctaText: { color: '#fff', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#151519', marginVertical: 12 }
});
