import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function TemplateCard({ template, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(template)}>
      {template.thumbnail ? (
        <Image source={{ uri: template.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
      <View style={styles.meta}>
        <Text style={styles.title}>{template.title}</Text>
        <Text style={styles.subtitle}>{template.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 12,
    backgroundColor: '#0e0e12',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e24'
  },
  thumb: { width: '100%', height: 120, backgroundColor: '#222' },
  thumbPlaceholder: { width: '100%', height: 120, backgroundColor: '#151519' },
  meta: { padding: 10 },
  title: { color: '#a2c2ff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#bfc7ff', fontSize: 12, marginTop: 6 }
});
