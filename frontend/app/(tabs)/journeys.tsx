import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function JourneysScreen() {
  const { journeys, fetchJourneys, isLoading } = useJourneyStore();

  useEffect(() => {
    fetchJourneys();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() => router.push(`/journey/${item._id}`)}
  >
    <Image
      source={{
        uri:
          item.coverImage ||
          "https://via.placeholder.com/400x300",
      }}
      style={styles.image}
    />

    <View style={styles.cardOverlay}>
      <Text
        style={styles.cardTitle}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <View style={styles.cardStats}>
        <View style={styles.cardStat}>
          <Ionicons
            name="images-outline"
            size={14}
            color={Colors.text.tertiary}
          />

          <Text style={styles.cardStatText}>
            {item.memoryCount ?? 0}
          </Text>
        </View>

        <View style={styles.cardStat}>
          <Ionicons
            name="people-outline"
            size={14}
            color={Colors.text.tertiary}
          />

          <Text style={styles.cardStatText}>
            {item.members?.length ?? 0}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Journeys</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary.main }]}
          onPress={() => router.push('/create')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={journeys}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  list: { padding: 8 },
  card: {
    flex: 1,
    margin: 8,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  image: { width: '100%', height: '100%' },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(251, 249, 246, 0.92)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});