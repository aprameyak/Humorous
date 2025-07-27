import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Humorous</Text>
        <Text style={styles.subtitle}>Your personalized joke app</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.status}>✅ iOS App is working!</Text>
          <Text style={styles.status}>✅ React Native is functional</Text>
          <Text style={styles.status}>✅ Simulator is connected</Text>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 40,
  },
  status: {
    fontSize: 16,
    color: '#00ff00',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 