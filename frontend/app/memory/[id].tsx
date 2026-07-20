import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemoryStore } from '../../src/store';
import { Colors } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const memoryId = id;
  const { currentMemory, fetchMemory, deleteMemory, isLoading } = useMemoryStore();

  useEffect(() => {
    if (!memoryId) return;

    fetchMemory(memoryId);
  }, [memoryId]);

  const handleDelete = () => {
    Alert.alert('Delete Memory', 'Are you sure you want to delete this memory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMemory(memoryId);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !currentMemory) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: currentMemory.imageUrl }} style={styles.image} />

        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: Colors.primary.main,
                },
                ]}
            >
              <Text style={styles.avatarText}>
                {typeof currentMemory.uploadedBy === "object" &&
                currentMemory.uploadedBy?.fullName
                  ? currentMemory.uploadedBy.fullName.charAt(0)
                  : "U"}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  styles.userName,
                  {
                    color: Colors.text.primary,
                  },
                ]}
              >
                {typeof currentMemory.uploadedBy === "object" &&
                currentMemory.uploadedBy?.fullName
                  ? currentMemory.uploadedBy.fullName
                  : "Unknown"}
              </Text>
              <Text
                style={[
                  styles.date,
                  {
                    color: Colors.text.secondary,
                  },
                ]}
              >
                {new Date(
                  currentMemory.memoryDate ||
                    currentMemory.createdAt
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Caption */}
          <Text style={[styles.caption, { color: Colors.text.primary }]}>
            {currentMemory.caption || "Untitled Memory"}
          </Text>

          {/* Story */}
          {!!currentMemory.story && (
            <View style={[styles.storyContainer, { backgroundColor: Colors.background.primary }]}>
              <Text style={[styles.storyTitle, { color: Colors.text.primary }]}>
                📖 Story
              </Text>
              <Text style={[styles.storyText, { color: Colors.text.secondary }]}>
                {currentMemory.story}
              </Text>
            </View>
          )}

          {/* Location */}
          {currentMemory.location && (
            <View style={styles.location}>
              <Ionicons name="location-outline" size={16} color={Colors.primary.main} />
              <Text style={[styles.locationText, { color: Colors.primary.main }]}>
                {currentMemory.location}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: { width: width, height: width, backgroundColor: Colors.border.light },

  content: { padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  userName: { fontSize: 16, fontWeight: '600', fontFamily: 'Georgia, serif' },
  date: { fontSize: 13, marginTop: 2, fontFamily: 'Inter, sans-serif' },

  caption: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia, serif',
    marginBottom: 16,
    lineHeight: 28,
  },

  storyContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  storyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, fontFamily: 'Georgia, serif' },
  storyText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Inter, sans-serif',
  },

  location: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 14, marginLeft: 4, fontFamily: 'Inter, sans-serif' },
});