import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme';

const SECTIONS = [
  {
    title: '1. What we collect',
    body: 'When you create an account, we store your name, email address, and a username. When you use the app, we store the journeys, memories, photos, captions, and stories you choose to add.',
  },
  {
    title: '2. How we use your information',
    body: 'Your information is used only to run the app: showing your journeys and memories to you and to the people you invite, sending you invitation notifications, and letting you sign in securely.',
  },
  {
    title: '3. Photos and media',
    body: 'Photos you upload are stored with our media hosting provider (Cloudinary) and are only accessible through the app. Deleting a memory also removes its photo from storage.',
  },
  {
    title: '4. Sharing with other people',
    body: 'A journey and its memories are only visible to the members of that journey. You control who joins by sending and cancelling invitations from the "Travel together" screen.',
  },
  {
    title: '5. Data storage and security',
    body: 'Passwords are never stored in plain text. Your session is kept on your device using secure storage, and all requests to our server require that secure sign-in token.',
  },
  {
    title: '6. Your choices',
    body: 'You can edit or delete any memory or journey you created at any time. You can also update your profile details and photo from the Profile tab, or sign out to end your session on this device.',
  },
  {
    title: '7. Third-party services',
    body: 'We use third-party infrastructure providers (such as our hosting and media storage providers) purely to run the app. These providers do not use your content for their own purposes.',
  },
  {
    title: '8. Changes to this policy',
    body: 'Memora is a student project built for learning purposes. This policy may be updated as the app changes, and the latest version will always be available from this screen.',
  },
  {
    title: '9. Contact',
    body: 'Questions about your data can be sent through the Help & Support screen in the app.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          This policy explains what information Memora collects and how it is used. Memora is a
          personal, collaborative memory-journaling app — we only use your information to make the
          app work for you and the people you share journeys with.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.updated}>Last updated: 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
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
  headerButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  content: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 21,
    marginBottom: 20,
    fontFamily: 'Inter, sans-serif',
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
    fontFamily: 'Georgia, serif',
  },
  sectionBody: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  updated: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Inter, sans-serif',
  },
});
