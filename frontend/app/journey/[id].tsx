import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useJourneyStore, useMemoryStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const journeyId = id;

  const { currentJourney, fetchJourney, isLoading } = useJourneyStore();
  const { memories, fetchJourneyMemories, addMemory } = useMemoryStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [caption, setCaption] = useState('');
  const [story, setStory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery'>('timeline');

  useEffect(() => {
    if (!journeyId) return;

    fetchJourney(journeyId);
    fetchJourneyMemories(journeyId);
  }, [journeyId]);

  const onRefresh = async () => {
    if (!journeyId) return;

    setRefreshing(true);

    try {
      await Promise.all([
        fetchJourney(journeyId),
        fetchJourneyMemories(journeyId),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddMemory = async () => {
    if (!image || !caption.trim()) {
      Alert.alert('Error', 'Please add image and caption');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('story', story);
    formData.append('memory_date', new Date().toISOString());
    formData.append("journey_id", journeyId);
    formData.append('image', {
      uri: image,
      name: 'memory.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      await addMemory(journeyId, formData);
      setShowAddMemory(false);
      setCaption('');
      setStory('');
      setImage(null);
      await fetchJourneyMemories(journeyId);
      Alert.alert('Success', 'Memory added!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add memory');
    }
  };

  if (isLoading || !currentJourney) {
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
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentJourney.title}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Cover */}
      <Image source={{ uri: currentJourney.coverImage }} style={styles.coverImage} />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{currentJourney.title}</Text>
        <Text style={styles.description}>{currentJourney.description}</Text>
        {currentJourney.location && (
          <View style={styles.location}>
            <Ionicons name="location-outline" size={16} color={Colors.primary.main} />
            <Text style={[styles.locationText, { color: Colors.primary.main }]}>
              {currentJourney.location}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'timeline' && styles.activeTabText,
            ]}
          >
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'gallery' && styles.activeTabText,
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.main}
          />
        }
        contentContainerStyle={styles.content}
      >
        {activeTab === 'timeline' && (
          memories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={Colors.border.light} />
              <Text style={[styles.emptyStateText, { color: Colors.text.secondary }]}>
                No memories yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: Colors.text.tertiary }]}>
                Be the first to add a memory
              </Text>
            </View>
          ) : (
            memories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.timelineItem, { borderColor: Colors.border.light }]}
                onPress={() => router.push(`/memory/${item._id}`)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.timelineImage} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineCaption, { color: Colors.text.primary }]}>
                    {item.caption}
                  </Text>
                  {item.story && (
                    <Text
                      style={[styles.timelineStory, { color: Colors.text.secondary }]}
                      numberOfLines={2}
                    >
                      {item.story}
                    </Text>
                  )}
                  <View style={styles.timelineFooter}>
                    <View style={styles.timelineUser}>
                      <View style={[styles.timelineAvatar, { backgroundColor: Colors.primary.main }]}>
                        <Text style={styles.timelineAvatarText}>
                          {(item as any).uploader?.fullName?.[0] || 'U'}
                        </Text>
                      </View>
                      <Text style={[styles.timelineUserName, { color: Colors.text.secondary }]}>
                        {(item as any).uploader?.fullName || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={[styles.timelineDate, { color: Colors.text.tertiary }]}>
                      {new Date(item.memoryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        )}

        {activeTab === 'gallery' && (
          <View style={styles.galleryGrid}>
            {memories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.galleryItem}
                onPress={() => router.push(`/memory/${item._id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary.main }]}
        onPress={() => setShowAddMemory(true)}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Memory Modal */}
      <Modal visible={showAddMemory} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>
                Add Memory
              </Text>
              <TouchableOpacity onPress={() => setShowAddMemory(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalImagePicker, { borderColor: Colors.border.light }]}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.modalImagePreview} />
              ) : (
                <View style={styles.modalImagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color={Colors.text.tertiary} />
                  <Text style={[styles.modalImageText, { color: Colors.text.secondary }]}>
                    Tap to add photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={[styles.modalInput, { borderColor: Colors.border.light, color: Colors.text.primary }]}
              placeholder="Caption..."
              placeholderTextColor={Colors.text.tertiary}
              value={caption}
              onChangeText={setCaption}
            />

            <TextInput
              style={[
                styles.modalInput,
                styles.modalTextArea,
                { borderColor: Colors.border.light, color: Colors.text.primary },
              ]}
              placeholder="Story (optional)"
              placeholderTextColor={Colors.text.tertiary}
              value={story}
              onChangeText={setStory}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Colors.primary.main }]}
              onPress={handleAddMemory}
            >
              <Text style={styles.modalButtonText}>Share Memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
  },

  coverImage: { width: '100%', height: 200 },
  info: { padding: 20, backgroundColor: Colors.background.secondary },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 24,
  },
  location: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  locationText: { fontSize: 14, marginLeft: 4, fontFamily: 'Inter, sans-serif' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  activeTab: { backgroundColor: Colors.primary.main },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  activeTabText: { color: '#FFFFFF' },

  content: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, marginTop: 12, fontFamily: 'Georgia, serif' },
  emptyStateSubtext: { fontSize: 14, marginTop: 4, fontFamily: 'Inter, sans-serif' },

  timelineItem: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  timelineImage: { width: '100%', height: 200 },
  timelineContent: { padding: 14 },
  timelineCaption: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia, serif',
  },
  timelineStory: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timelineUser: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineAvatarText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  timelineUserName: { fontSize: 13, fontFamily: 'Inter, sans-serif' },
  timelineDate: { fontSize: 12, fontFamily: 'Inter, sans-serif' },

  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  galleryItem: { width: '33.33%', aspectRatio: 1, padding: 2 },
  galleryImage: { width: '100%', height: '100%', borderRadius: 4 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'Georgia, serif' },
  modalImagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  modalImagePreview: { width: '100%', height: '100%' },
  modalImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalImageText: { fontSize: 14, marginTop: 8, fontFamily: 'Inter, sans-serif' },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: Colors.background.primary,
    fontFamily: 'Inter, sans-serif',
  },
  modalTextArea: { height: 80, textAlignVertical: 'top' },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
});