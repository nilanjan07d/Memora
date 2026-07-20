import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, useJourneyStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { journeys } = useJourneyStore();
  const [isDark, setIsDark] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stats = {
    journeys: journeys.length,
    memories: 0,
    members: 0,
  };

  useEffect(() => {
    if (user) {
      setNewName(user.fullName || '');
      setNewBio(user.bio || '');
    }
  }, [user]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsLoading(true);
      try {
        updateUser({ profilePicture: result.assets[0].uri });
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      updateUser({ fullName: newName, bio: newBio });
      Alert.alert('Success', 'Profile updated!');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsIcon}>
          <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: Colors.primary.main }]}>
              <Text style={styles.avatarText}>{getInitials(user?.fullName || 'User')}</Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: Colors.primary.main }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: Colors.primary.main }]}
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary.main} />
          <Text style={[styles.editButtonText, { color: Colors.primary.main }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.journeys}</Text>
            <Text style={styles.statLabel}>Journeys</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: Colors.border.light }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.memories}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: Colors.border.light }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.members}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Settings</Text>

        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5EDE8' }]}>
              <Ionicons name="moon-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.menuText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            trackColor={{ false: Colors.border.light, true: Colors.primary.main }}
            thumbColor={isDark ? Colors.primary.main : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5EDE8' }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
          </View>
          <View style={[styles.menuBadge, { backgroundColor: Colors.accent.pink }]}>
            <Text style={styles.menuBadgeText}>3</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5EDE8' }]}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5EDE8' }]}>
              <Ionicons name="trophy-outline" size={20} color={Colors.accent.pink} />
            </View>
            <Text style={styles.menuText}>Achievements</Text>
          </View>
          <View style={[styles.menuBadge, { backgroundColor: Colors.accent.pink }]}>
            <Text style={styles.menuBadgeText}>5</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.accent.pink} />
        <Text style={[styles.logoutText, { color: Colors.accent.pink }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Memora v1.0.0</Text>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalAvatarContainer} onPress={pickImage}>
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.modalAvatar} />
              ) : (
                <View style={[styles.modalAvatar, { backgroundColor: Colors.primary.main }]}>
                  <Text style={styles.modalAvatarText}>
                    {getInitials(user?.fullName || 'User')}
                  </Text>
                </View>
              )}
              <View style={[styles.modalCameraBadge, { backgroundColor: Colors.primary.main }]}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.modalLabel}>Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newBio}
              onChangeText={setNewBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: Colors.primary.main }]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.secondary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  settingsIcon: { padding: 4 },

  profileCard: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  editButtonText: { fontSize: 14, fontWeight: '500' },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontFamily: 'Inter, sans-serif',
  },
  statDivider: { width: 1, height: 30 },

  menuSection: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Inter, sans-serif',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  menuBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FDF2F8',
    gap: 10,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 16,
    marginBottom: 32,
    fontFamily: 'Inter, sans-serif',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  modalAvatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  modalCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 6,
    fontFamily: 'Inter, sans-serif',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: Colors.background.primary,
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  modalTextArea: { height: 80, textAlignVertical: 'top' },
  modalSaveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
});