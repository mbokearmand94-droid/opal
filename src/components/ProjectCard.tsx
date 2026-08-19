import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProjectCard({ project, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(project)}>
      <View style={styles.meta}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.subtitle}>{project.modifiedAt ? `Modifié: ${new Date(project.modifiedAt).toLocaleString()}` : 'Nouveau'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#0e0e12',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e1e24'
  },
  meta: {},
  title: { color: '#a2c2ff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#bfc7ff', fontSize: 12, marginTop: 6 }
});
