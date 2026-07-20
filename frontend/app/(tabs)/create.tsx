import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useJourneyStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function CreateJourneyScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const { createJourney, isLoading } = useJourneyStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !coverImage) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append("startDate", new Date().toISOString());
    formData.append("endDate", new Date().toISOString());

    formData.append(
      "coverImage",
      {
        uri: coverImage,
        name: "cover.jpg",
        type: "image/jpeg",
      } as any
    );
    try {
      createJourney(formData);
      Alert.alert('Success', 'Journey created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create journey');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Journey</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.imagePickerWrapper}>
        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: Colors.primary.main }]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={48} color={Colors.primary.main} />
              <Text style={[styles.placeholderText, { color: Colors.text.secondary }]}>
                Add Cover Image
              </Text>
              <Text style={[styles.placeholderSubtext, { color: Colors.text.tertiary }]}>
                Tap to select a photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Journey Title *</Text>
          <TextInput
            style={[styles.input, { borderColor: Colors.border.light }]}
            placeholder="e.g., Summer in Tuscany"
            placeholderTextColor={Colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: Colors.border.light }]}
            placeholder="Describe the essence of this journey..."
            placeholderTextColor={Colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <View style={[styles.locationInput, { borderColor: Colors.border.light }]}>
            <Ionicons name="location-outline" size={20} color={Colors.primary.main} />
            <TextInput
              style={[styles.locationTextInput, { color: Colors.text.primary }]}
              placeholder="Where was this journey?"
              placeholderTextColor={Colors.text.tertiary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Launch Journey</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  imagePickerWrapper: { paddingHorizontal: 20, marginTop: 20 },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.secondary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
  },
  coverImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, marginTop: 8, fontFamily: 'Inter, sans-serif' },
  placeholderSubtext: { fontSize: 13, marginTop: 4, fontFamily: 'Inter, sans-serif' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 6,
    fontFamily: 'Inter, sans-serif',
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  locationTextInput: { flex: 1, paddingVertical: 15, fontSize: 16, fontFamily: 'Inter, sans-serif' },
  submitButton: {
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  disabled: { opacity: 0.6 },
});