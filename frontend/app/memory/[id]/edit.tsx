import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMemoryStore } from '../../../src/store';
import { Colors } from '../../../src/theme';

export default function EditMemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memoryId = id;

  const { currentMemory, fetchMemory, updateMemory, isLoading: isMemoryLoading } =
    useMemoryStore();

  const [caption, setCaption] = useState('');
  const [story, setStory] = useState('');
  const [location, setLocation] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!memoryId) return;
    fetchMemory(memoryId);
  }, [memoryId]);

  // Pre-fill the form once the memory has loaded - guarded by `hydrated` so
  // we don't stomp on text the person is actively editing if this effect
  // re-runs after a background refetch.
  useEffect(() => {
    if (currentMemory && !hydrated && currentMemory._id === memoryId) {
      setCaption(currentMemory.caption || '');
      setStory(currentMemory.story || '');
      setLocation(currentMemory.location || '');
      setHydrated(true);
    }
  }, [currentMemory, hydrated, memoryId]);

  const pickImage = async () => {
    if (isSaving) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Guards against duplicate submits from a fast double-tap, same as the
    // add-memory flow.
    if (isSaving) return;

    if (!caption.trim()) {
      Alert.alert('Error', 'Caption cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      if (newImage) {
        const formData = new FormData();
        formData.append('caption', caption.trim());
        formData.append('story', story.trim());
        formData.append('location', location.trim());
        formData.append('image', {
          uri: newImage,
          name: 'memory.jpg',
          type: 'image/jpeg',
        } as any);
        await updateMemory(memoryId, formData as any);
      } else {
        await updateMemory(memoryId, {
          caption: caption.trim(),
          story: story.trim(),
          location: location.trim(),
        });
      }
      await fetchMemory(memoryId);
      router.back();
    } catch (error: any) {
      Alert.alert('Could not save changes', error.message || 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isMemoryLoading && !hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  const displayImage = newImage || currentMemory?.imageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => !isSaving && router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Memory</Text>
        <TouchableOpacity
          style={[styles.headerButton, isSaving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary.main} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imageWrapper} onPress={pickImage} activeOpacity={0.85}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color={Colors.text.tertiary} />
            </View>
          )}
          <View style={styles.imageEditBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.imageEditBadgeText}>Change photo</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Give this memory a caption"
          placeholderTextColor={Colors.text.tertiary}
          maxLength={120}
        />

        <Text style={styles.label}>Story</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={story}
          onChangeText={setStory}
          placeholder="Add or edit the story behind this memory"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={5}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Where was this?"
          placeholderTextColor={Colors.text.tertiary}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerButton: { minWidth: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  saveText: { fontSize: 15, fontWeight: '700', color: Colors.primary.main },
  content: { padding: 20, paddingBottom: 48 },
  imageWrapper: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: 220, backgroundColor: Colors.border.light },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imageEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageEditBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  textArea: { height: 110, textAlignVertical: 'top' },
});
