import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { supabase } from '../supabaseClient';

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to sign out...');
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error signing out:', error);
                Alert.alert('Error', 'Could not sign out. Please try again.');
              } else {
                console.log('Successfully signed out');
              }
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete account...');
              const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
              if (error) {
                console.error('Error deleting account:', error);
                Alert.alert('Error', 'Could not delete account. Please try again.');
                return;
              }
              console.log('Account deleted successfully, signing out...');
              await supabase.auth.signOut();
            } catch (e) {
              console.error('Unexpected error deleting account:', e);
              Alert.alert('Error', 'Unexpected error deleting account.');
            }
          }
        }
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Open Support Page',
      'This will open the support page in your browser. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL('https://humorous-admin.vercel.app/support')
              .catch(() => {
                Alert.alert(
                  'Error',
                  'Unable to open support page. Please visit https://humorous-admin.vercel.app/support in your browser.',
                  [{ text: 'OK', style: 'default' }]
                );
              });
          }
        }
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Open Privacy Policy',
      'This will open the privacy policy in your browser. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL('https://humorous-admin.vercel.app/privacy')
              .catch(() => {
                Alert.alert(
                  'Error',
                  'Unable to open privacy policy. Please visit https://humorous-admin.vercel.app/privacy in your browser.',
                  [{ text: 'OK', style: 'default' }]
                );
              });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
            <Text style={styles.menuItemText}>Support</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
            <Text style={styles.menuItemText}>Privacy</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <Text style={[styles.menuItemText, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={handleSignOut}>
            <Text style={styles.menuItemText}>Log Out</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Humorous v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Your daily dose of laughter</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 60,
  },
  backButtonText: {
    color: '#4285f4',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  profileIconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  menuSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 56,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  dangerText: {
    color: '#ff6b6b',
  },
  menuItemArrow: {
    fontSize: 16,
    color: '#888',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
