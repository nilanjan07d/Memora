import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme';

const FAQS = [
  {
    question: 'How do I create a journey?',
    answer:
      'Go to the Create tab, add a title, description, and dates, then tap "Launch Journey". You can add a cover photo and location too.',
  },
  {
    question: 'How do I add a memory to a journey?',
    answer:
      'Open a journey and tap the + button. Add a photo and caption (a story is optional), then tap "Share Memory".',
  },
  {
    question: 'How do I invite someone to my journey?',
    answer:
      'Open the journey, tap "Travel together", and search for them by name, username, or email. They will get a notification to accept or decline.',
  },
  {
    question: 'Can I cancel an invitation I sent?',
    answer:
      'Yes. Open "Travel together" from the journey, and you can cancel any invitation that is still pending.',
  },
  {
    question: 'How do I edit or delete a memory?',
    answer:
      'Open the memory from a journey timeline or the home screen. Use the edit (pencil) icon to change the caption, story, or photo, or the trash icon to delete it.',
  },
  {
    question: 'Who can see my journeys?',
    answer:
      'Only people you invite as members can see a journey and its memories, unless you mark it public.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      activeOpacity={0.8}
      onPress={() => setOpen((current) => !current)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.text.tertiary}
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        {FAQS.map((faq) => (
          <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Still need help?</Text>
        <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.8}
          onPress={() => Linking.openURL('mailto:support@memora.app?subject=Memora%20support')}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#F5EDE8' }]}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary.main} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Email support</Text>
            <Text style={styles.contactSubtitle}>support@memora.app</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Memora is a student project. Response times may vary, but we read every message.
        </Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    fontFamily: 'Georgia, serif',
  },
  faqItem: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 10,
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  contactSubtitle: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontFamily: 'Inter, sans-serif',
  },
  footerNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    fontFamily: 'Inter, sans-serif',
  },
});
