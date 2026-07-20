import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  useAuthStore,
  useJourneyStore,
  useMemoryStore,
} from "../../src/store";

import { Colors } from "../../src/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuthStore();

  const {
    journeys,
    isLoading,
    fetchJourneys,
  } = useJourneyStore();

  const {
    memories,
  } = useMemoryStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchJourneys();
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning ☀️";
    if (hour < 17) return "Good afternoon 🌤️";

    return "Good evening 🌙";
  };

  const getUploaderName = (memory: any) => {
    if (
      typeof memory.uploadedBy === "object" &&
      memory.uploadedBy?.fullName
    ) {
      return memory.uploadedBy.fullName;
    }

    return "Unknown";
  };

  const getUploaderInitial = (memory: any) => {
    if (
      typeof memory.uploadedBy === "object" &&
      memory.uploadedBy?.fullName
    ) {
      return memory.uploadedBy.fullName.charAt(0);
    }

    return "U";
  };

  const getImageUrl = (memory: any) => {
    if (memory.imageUrl) return memory.imageUrl;

    if (memory.images?.length)
      return typeof memory.images[0] === "string"
        ? memory.images[0]
        : memory.images[0]?.url;

    if (memory.media?.length)
      return typeof memory.media[0] === "string"
        ? memory.media[0]
        : memory.media[0]?.url;

    return "https://via.placeholder.com/300";
  };

  const getMemoryDate = (memory: any) => {
    return new Date(
      memory.memoryDate ||
        memory.createdAt ||
        Date.now()
    );
  };

  if (isLoading && journeys.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Header */}
<View style={styles.header}>
  <View>
    <Text style={styles.greeting}>{getGreeting()}</Text>
    <Text style={styles.name}>
      {user?.fullName?.split(" ")[0] || "Traveler"}
    </Text>
    <Text style={styles.subGreeting}>
      Ready to revisit some magic?
    </Text>
  </View>

  <TouchableOpacity style={styles.notificationButton}>
    <Ionicons
      name="notifications-outline"
      size={24}
      color={Colors.text.primary}
    />

    <View
      style={[
        styles.badge,
        {
          backgroundColor: Colors.primary.main,
        },
      ]}
    />
  </TouchableOpacity>
</View>

{/* Search */}
<TouchableOpacity style={styles.searchBar}>
  <Ionicons
    name="search-outline"
    size={20}
    color={Colors.text.tertiary}
  />

  <Text style={styles.searchText}>
    Search for a feeling, place, or person
  </Text>
</TouchableOpacity>

{/* Memory Categories */}
<View style={styles.categorySection}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categoryList}
  >
    {["Memories", "Summer", "Family", "Celebration"].map(
      (cat, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.categoryChip,
            i === 0 && {
              backgroundColor: Colors.primary.main,
            },
            i === 1 && {
              backgroundColor: Colors.secondary.main,
            },
            i === 2 && {
              backgroundColor: Colors.accent.pink,
            },
            i === 3 && {
              backgroundColor: Colors.brand.light,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              i < 3 && {
                color: "#FFFFFF",
              },
              i === 3 && {
                color: Colors.text.primary,
              },
            ]}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      )
    )}
  </ScrollView>
</View>

      {/* Recent Journeys */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text
      style={[
        styles.sectionTitle,
        { color: Colors.text.primary },
      ]}
    >
      Recent Journeys
    </Text>

    <TouchableOpacity
      onPress={() => router.push("/journeys")}
    >
      <Text
        style={[
          styles.seeAll,
          { color: Colors.primary.main },
        ]}
      >
        See All
      </Text>
    </TouchableOpacity>
  </View>

  {journeys.length === 0 ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No journeys yet
      </Text>

      <TouchableOpacity
        style={[
          styles.emptyStateButton,
          {
            backgroundColor: Colors.primary.main,
          },
        ]}
        onPress={() => router.push("/create")}
      >
        <Text style={styles.emptyStateButtonText}>
          Create Your First Journey
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    journeys.slice(0, 3).map((journey) => (
      <TouchableOpacity
        key={journey._id}
        style={styles.journeyCard}
        activeOpacity={0.8}
        onPress={() =>
          router.push(`/journey/${journey._id}`)
        }
      >
        <Image
          source={{
            uri:
              journey.coverImage ||
              "https://via.placeholder.com/600x400",
          }}
          style={styles.journeyImage}
        />

        <View style={styles.journeyOverlay}>
          <Text
            style={styles.journeyTitle}
            numberOfLines={1}
          >
            {journey.title}
          </Text>

          <View style={styles.journeyMeta}>
            <Text style={styles.journeyDate}>
              {journey.startDate
                ? new Date(
                    journey.startDate
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No Date"}
            </Text>

            <Text style={styles.journeyCount}>
              {journey.members?.length ?? 0} Members
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ))
  )}
</View>

      {/* Recent Memories */}
<View style={[styles.section, styles.lastSection]}>
  <View style={styles.sectionHeader}>
    <Text
      style={[
        styles.sectionTitle,
        {
          color: Colors.text.primary,
        },
      ]}
    >
      Recent Memories
    </Text>
  </View>

  {memories.length === 0 ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No memories yet
      </Text>
    </View>
  ) : (
    memories.slice(0, 3).map((memory) => (
      <TouchableOpacity
        key={memory._id}
        style={styles.memoryCard}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/memory/${memory._id}`)
        }
      >
        <Image
          source={{
            uri: getImageUrl(memory),
          }}
          style={styles.memoryImage}
        />

        <View style={styles.memoryContent}>
          <Text
            style={styles.memoryCaption}
            numberOfLines={2}
          >
            {memory.caption || "Untitled Memory"}
          </Text>

          <View style={styles.memoryFooter}>
            <View style={styles.memoryUser}>
              <View
                style={[
                  styles.memoryAvatar,
                  {
                    backgroundColor:
                      Colors.primary.main,
                  },
                ]}
              >
                <Text style={styles.memoryAvatarText}>
                  {getUploaderInitial(memory)}
                </Text>
              </View>

              <Text
                style={styles.memoryUserName}
                numberOfLines={1}
              >
                {getUploaderName(memory)}
              </Text>
            </View>

            <Text style={styles.memoryDate}>
              {getMemoryDate(memory).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ))
  )}
</View>

{/* FAB */}
<TouchableOpacity
  style={[
    styles.fab,
    {
      backgroundColor:
        Colors.primary.main,
    },
  ]}
  onPress={() => router.push("/create")}
>
  <Ionicons
    name="add"
    size={32}
    color="#FFFFFF"
  />
</TouchableOpacity>
</ScrollView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background.secondary,
  },
  greeting: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
    marginTop: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
    fontFamily: 'Inter, sans-serif',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 10,
  },
  searchText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontFamily: 'Inter, sans-serif',
  },

  // Categories
  categorySection: { paddingVertical: 8 },
  categoryList: { paddingHorizontal: 20, gap: 10 },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },

  // Journeys
  section: {
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
    marginTop: 8,
  },
  lastSection: { paddingBottom: 80 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia, serif',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },

  journeyCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  journeyImage: { width: '100%', height: 180 },
  journeyOverlay: { padding: 16 },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  journeyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  journeyDate: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  journeyCount: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontFamily: 'Inter, sans-serif',
  },

  // Memories
  memoryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 12,
    height: 90,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  memoryImage: { width: 90, height: '100%' },
  memoryContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  memoryCaption: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
    fontFamily: 'Inter, sans-serif',
  },
  memoryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memoryUser: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memoryAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryAvatarText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  memoryUserName: {
    fontSize: 12,
    color: Colors.text.secondary,
    maxWidth: 80,
    fontFamily: 'Inter, sans-serif',
  },
  memoryDate: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontFamily: 'Inter, sans-serif',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  emptyStateButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },

  // FAB
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
});