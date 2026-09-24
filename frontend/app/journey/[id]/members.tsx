import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useJourneyStore } from '../../../src/store';
import { journeyService } from '../../../src/services/journey.service';
import { Colors } from '../../../src/theme';

function initial(name?: string) {
  return name?.trim()?.[0]?.toUpperCase() || '?';
}

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentJourney, fetchJourney } = useJourneyStore();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [invites, setInvites] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const members: any[] = currentJourney?.members || [];
  const isAdmin = members.some(
    (member) => (member.userId?._id || member.userId) === user?._id && member.role === 'admin'
  );

  const loadInvites = useCallback(async () => {
    if (!id || !isAdmin) {
      setInvitesLoading(false);
      return;
    }
    setInvitesLoading(true);
    try {
      const response: any = await (journeyService as any).getInvites(id);
      setInvites(response.invites || []);
    } catch {
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (!currentJourney) fetchJourney(id);
  }, [id]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const response: any = await journeyService.searchUsers(query.trim());
        setUsers(response.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const dismissDropdown = () => {
    Keyboard.dismiss();
    setShowResults(false);
  };

  const invite = async (invitee: any) => {
    try {
      await journeyService.inviteMember(id, invitee._id);
      Alert.alert('Invitation sent', `${invitee.fullName} can accept it from Notifications.`);
      setUsers((current) => current.filter((item) => item._id !== invitee._id));
      loadInvites();
    } catch (error: any) {
      Alert.alert('Could not send invitation', error.message || 'Please try again.');
    }
  };

  const cancelInvite = (invite: any) => {
    Alert.alert(
      'Cancel invitation',
      `Cancel the invitation sent to ${invite.recipientId?.fullName || 'this person'}?`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel invite',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(invite._id);
            try {
              await (journeyService as any).cancelInvite(id, invite._id);
              setInvites((current) => current.filter((item) => item._id !== invite._id));
            } catch (error: any) {
              Alert.alert('Could not cancel invitation', error.message || 'Please try again.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Pressable style={s.container} onPress={dismissDropdown}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Travel together</Text>
        <View style={s.headerButton} />
      </View>

      <FlatList
        data={showResults ? users : []}
        keyExtractor={(item) => item._id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            {/* Current members */}
            <Text style={s.sectionTitle}>Members ({members.length})</Text>
            {members.map((member) => {
              const person = member.userId || {};
              return (
                <View key={person._id || Math.random()} style={s.memberRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{initial(person.fullName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{person.fullName || 'Unknown'}</Text>
                    <Text style={s.subtext}>{person.username ? `@${person.username}` : person.email}</Text>
                  </View>
                  {member.role === 'admin' && (
                    <View style={s.roleBadge}>
                      <Text style={s.roleBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Pending invites - admin only */}
            {isAdmin && (
              <>
                <Text style={[s.sectionTitle, { marginTop: 20 }]}>Pending invites</Text>
                {invitesLoading ? (
                  <ActivityIndicator color={Colors.primary.main} style={{ marginVertical: 12 }} />
                ) : invites.length === 0 ? (
                  <Text style={s.empty}>No pending invitations.</Text>
                ) : (
                  invites.map((invite) => (
                    <View key={invite._id} style={s.memberRow}>
                      <View style={[s.avatar, { backgroundColor: Colors.secondary.main }]}>
                        <Text style={s.avatarText}>{initial(invite.recipientId?.fullName)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.name}>{invite.recipientId?.fullName || 'Unknown'}</Text>
                        <Text style={s.subtext}>
                          {invite.recipientId?.username
                            ? `@${invite.recipientId.username}`
                            : invite.recipientId?.email}{' '}
                          · Invited
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={s.cancelButton}
                        onPress={() => cancelInvite(invite)}
                        disabled={cancellingId === invite._id}
                      >
                        {cancellingId === invite._id ? (
                          <ActivityIndicator size="small" color={Colors.accent.pink} />
                        ) : (
                          <Ionicons name="close" size={16} color={Colors.accent.pink} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            )}

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Invite someone new</Text>
            <TextInput
              style={s.input}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search name, username, or email"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="none"
            />
            {showResults && query.trim().length >= 2 && loading && (
              <Text style={s.empty}>Searching…</Text>
            )}
            {showResults && query.trim().length >= 2 && !loading && users.length === 0 && (
              <Text style={s.empty}>No registered users found.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.memberRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial(item.fullName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.fullName}</Text>
              <Text style={s.subtext}>{item.username ? `@${item.username}` : item.email}</Text>
            </View>
            <TouchableOpacity style={s.invite} onPress={() => invite(item)}>
              <Text style={s.inviteText}>Invite</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </Pressable>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginHorizontal: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 14,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
  },
  memberRow: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  name: { fontWeight: '700', color: Colors.text.primary },
  subtext: { color: Colors.text.tertiary, fontSize: 12, marginTop: 2 },
  roleBadge: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary },
  cancelButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FBECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invite: { backgroundColor: Colors.primary.main, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  inviteText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 16, marginHorizontal: 16, color: Colors.text.tertiary },
});
