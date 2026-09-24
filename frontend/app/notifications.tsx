import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../src/services/notification.service';
import { useJourneyStore } from '../src/store';
import { Colors } from '../src/theme';

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const { fetchJourneys } = useJourneyStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await notificationService.getAll();
      setItems(response.notifications || []);
    } catch (error: any) {
      Alert.alert('Could not load notifications', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const respond = async (id: string, action: 'accept' | 'reject') => {
    setRespondingId(id);
    try {
      await notificationService.respond(id, action);
      await fetchJourneys();
      await load();
    } catch (error: any) {
      Alert.alert('Could not update invitation', error.message);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <View style={s.headerButton} />
      </View>

      {loading ? (
        <ActivityIndicator style={s.loader} color={Colors.primary.main} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={items.length ? { paddingVertical: 8 } : s.empty}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.border.medium} />
              <Text style={s.emptyText}>No notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {item.senderId?.fullName?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.message}>
                    <Text style={{ fontWeight: '700' }}>
                      {item.senderId?.fullName || 'Someone'}
                    </Text>{' '}
                    invited you to{' '}
                    <Text style={{ fontWeight: '700' }}>
                      {item.journeyId?.title || 'a journey'}
                    </Text>
                  </Text>
                  {!!item.message && <Text style={s.note}>{item.message}</Text>}
                </View>
              </View>

              {item.status === 'pending' ? (
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.accept}
                    onPress={() => respond(item._id, 'accept')}
                    disabled={respondingId === item._id}
                  >
                    {respondingId === item._id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={s.acceptText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.reject}
                    onPress={() => respond(item._id, 'reject')}
                    disabled={respondingId === item._id}
                  >
                    <Text style={s.rejectText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={s.status}>{item.status}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, fontFamily: 'Georgia, serif' },
  loader: { marginTop: 30 },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, color: Colors.text.tertiary },
  card: { margin: 12, padding: 16, borderRadius: 14, backgroundColor: Colors.background.secondary, borderWidth: 1, borderColor: Colors.border.light },
  cardRow: { flexDirection: 'row', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  message: { color: Colors.text.primary, lineHeight: 20 },
  note: { color: Colors.text.tertiary, fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  accept: { flex: 1, backgroundColor: Colors.primary.main, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700' },
  reject: { flex: 1, borderWidth: 1, borderColor: Colors.border.medium, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  rejectText: { color: Colors.text.secondary, fontWeight: '700' },
  status: { textTransform: 'capitalize', color: Colors.text.tertiary, marginTop: 10, fontSize: 12 },
});
