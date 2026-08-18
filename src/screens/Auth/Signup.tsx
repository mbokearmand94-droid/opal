import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert('Champs requis', 'Email et mot de passe requis');
    try {
      await signUp({ email, password });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de créer le compte');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="S'inscrire" onPress={onSubmit} />
      <View style={{ height: 12 }} />
      <Button title="J'ai déjà un compte" onPress={() => navigation.navigate('Login' as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#0b0b0d' },
  title: { color: '#a2c2ff', fontSize: 24, marginBottom: 12, textAlign: 'center' },
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }
});
