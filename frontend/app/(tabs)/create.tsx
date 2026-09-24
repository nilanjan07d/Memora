import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Pressable,
} from "react-native";
import { Image } from "expo-image";

import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useJourneyStore } from "../../src/store";
import { Colors } from "../../src/theme";

type PlaceSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function CreateJourneyScreen() {
  /* -------------------------------------------------------
     BASIC FORM
  ------------------------------------------------------- */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* -------------------------------------------------------
     LOCATION
  ------------------------------------------------------- */

  const [location, setLocation] = useState("");

  const [suggestions, setSuggestions] = useState<
    PlaceSuggestion[]
  >([]);

  const [searchingLocations, setSearchingLocations] =
    useState(false);

  /*
   * Coordinates are only saved when the user selects
   * a location suggestion.
   *
   * Manual locations can still be submitted without
   * coordinates.
   */
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const searchTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /* -------------------------------------------------------
     IMAGE
  ------------------------------------------------------- */

  const [coverImage, setCoverImage] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     DATES
  ------------------------------------------------------- */

  const [startDate, setStartDate] =
    useState(new Date());

  const [endDate, setEndDate] =
    useState(new Date());

  const [dateField, setDateField] =
    useState<"start" | "end" | null>(null);

  /* -------------------------------------------------------
     STORE
  ------------------------------------------------------- */

  const {
    createJourney,
    fetchJourneys,
    isLoading,
  } = useJourneyStore();

  /* -------------------------------------------------------
     CLEANUP SEARCH TIMER
  ------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  /* -------------------------------------------------------
     RESET
  ------------------------------------------------------- */

  const reset = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setSuggestions([]);
    setSelectedCoordinates(null);
    setCoverImage(null);
    setStartDate(new Date());
    setEndDate(new Date());
  };

  /* -------------------------------------------------------
     IMAGE PICKER
  ------------------------------------------------------- */

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo access to choose a cover image."
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  /* -------------------------------------------------------
     LOCATION SEARCH
  ------------------------------------------------------- */

  const searchLocations = (text: string) => {
    setLocation(text);

    /*
     * Once the user changes the text manually,
     * previously selected coordinates should not be
     * considered valid anymore.
     */
    setSelectedCoordinates(null);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    /*
     * Small delay prevents an API request for every
     * individual keystroke.
     */
    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchingLocations(true);

        const url =
          "https://nominatim.openstreetmap.org/search?" +
          `q=${encodeURIComponent(text.trim())}` +
          "&format=json" +
          "&addressdetails=1" +
          "&limit=6";

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "JourneyApp/1.0",
          },
        });

        if (!response.ok) {
          throw new Error(
            "Location search failed."
          );
        }

        const data: PlaceSuggestion[] =
          await response.json();

        setSuggestions(data || []);
      } catch (error) {
        console.log(
          "Location search error:",
          error
        );

        setSuggestions([]);
      } finally {
        setSearchingLocations(false);
      }
    }, 500);
  };

  /* -------------------------------------------------------
     SELECT LOCATION SUGGESTION
  ------------------------------------------------------- */

  const selectSuggestion = (
    place: PlaceSuggestion
  ) => {
    const latitude = Number(place.lat);
    const longitude = Number(place.lon);

    setLocation(place.display_name);

    setSelectedCoordinates({
      latitude,
      longitude,
    });

    setSuggestions([]);

    Keyboard.dismiss();
  };

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const submit = async () => {
    /*
     * Existing validation
     */

    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Missing details",
        "Add a title and description."
      );

      return;
    }

    if (endDate < startDate) {
      Alert.alert(
        "Invalid dates",
        "End date cannot be before start date."
      );

      return;
    }

    /*
     * FormData
     */

    const data = new FormData();

    const fields = [
      ["title", title.trim()],
      ["description", description.trim()],
      ["location", location.trim()],
      ["startDate", startDate.toISOString()],
      ["endDate", endDate.toISOString()],
    ];

    fields.forEach(([key, value]) => {
      data.append(key, value);
    });

    /*
     * Add coordinates only when the user selected
     * an autocomplete location.
     *
     * Manual location entry still works without them.
     */

    if (selectedCoordinates) {
      data.append(
        "latitude",
        String(selectedCoordinates.latitude)
      );

      data.append(
        "longitude",
        String(selectedCoordinates.longitude)
      );
    }

    /*
     * Cover image
     */

    if (coverImage) {
      data.append(
        "coverImage",
        {
          uri: coverImage,
          name: "cover.jpg",
          type: "image/jpeg",
        } as never
      );
    }

    /* -------------------------------------------------------
       CREATE JOURNEY
    ------------------------------------------------------- */

    try {
      await createJourney(data);

      await fetchJourneys();

      reset();

      Alert.alert(
        "Journey created",
        "Your journey is ready.",
        [
          {
            text: "View journeys",
            onPress: () =>
              router.replace("/journeys"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Could not create journey",
        error?.message || "Try again."
      );
    }
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        // Tapping anywhere outside the location field/dropdown closes the
        // suggestions list, matching how a dropdown should behave. Taps on
        // the input or a suggestion itself are handled by those elements
        // directly and never reach this handler.
        setSuggestions([]);
        Keyboard.dismiss();
      }}
    >
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Create Journey
        </Text>
      </View>

      <View style={styles.form}>
        {/* COVER IMAGE */}

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.cover}
            />
          ) : (
            <Text style={styles.imageText}>
              Add Cover Image (optional)
            </Text>
          )}
        </TouchableOpacity>

        {/* TITLE */}

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Journey title *"
          placeholderTextColor="#888"
        />

        {/* DESCRIPTION */}

        <TextInput
          style={[
            styles.input,
            styles.description,
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Description *"
          placeholderTextColor="#888"
        />

        {/* DATES */}

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.date}
            onPress={() =>
              setDateField("start")
            }
          >
            <Text style={styles.dateText}>
              Start:{" "}
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.date}
            onPress={() =>
              setDateField("end")
            }
          >
            <Text style={styles.dateText}>
              End:{" "}
              {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DATE PICKER */}

        {dateField && (
          <DateTimePicker
            value={
              dateField === "start"
                ? startDate
                : endDate
            }
            mode="date"
            onChange={(_, value) => {
              setDateField(null);

              if (!value) {
                return;
              }

              if (dateField === "start") {
                setStartDate(value);
              } else {
                setEndDate(value);
              }
            }}
          />
        )}

        {/* LOCATION LABEL */}

        <Text style={styles.sectionLabel}>
          Location
        </Text>

        {/* LOCATION INPUT */}

        <View style={styles.locationWrapper}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={searchLocations}
            placeholder="Search or enter location..."
            placeholderTextColor="#888"
            autoCorrect={false}
          />

          {searchingLocations && (
            <ActivityIndicator
              size="small"
              color={Colors.primary.main}
              style={styles.locationLoader}
            />
          )}
        </View>

        {/* LOCATION SUGGESTIONS */}

        {suggestions.length > 0 && (
          <View
            style={styles.suggestionsContainer}
          >
            {suggestions.map((place) => {
              const parts =
                place.display_name.split(",");

              const placeName =
                parts[0]?.trim() ||
                "Unknown location";

              const address = parts
                .slice(1)
                .join(",")
                .trim();

              return (
                <TouchableOpacity
                  key={place.place_id}
                  style={styles.suggestion}
                  onPress={() =>
                    selectSuggestion(place)
                  }
                  activeOpacity={0.7}
                >
                  {/* LOCATION ICON */}

                  <View
                    style={
                      styles.suggestionIcon
                    }
                  >
                    <Text
                      style={
                        styles.suggestionDot
                      }
                    >
                      ●
                    </Text>
                  </View>

                  {/* LOCATION TEXT */}

                  <View
                    style={
                      styles.suggestionContent
                    }
                  >
                    <Text
                      style={
                        styles.suggestionTitle
                      }
                      numberOfLines={1}
                    >
                      {placeName}
                    </Text>

                    <Text
                      style={
                        styles.suggestionAddress
                      }
                      numberOfLines={2}
                    >
                      {address}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* SELECTED LOCATION INFO */}

        {selectedCoordinates && (
          <View
            style={styles.selectedLocation}
          >
            <Text
              style={
                styles.selectedLocationLabel
              }
            >
              Location selected
            </Text>

            <Text
              style={
                styles.selectedLocationText
              }
              numberOfLines={2}
            >
              {location}
            </Text>
          </View>
        )}

        {/* LAUNCH BUTTON */}

        <TouchableOpacity
          style={[
            styles.button,
            isLoading &&
              styles.buttonDisabled,
          ]}
          disabled={isLoading}
          onPress={submit}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Launch Journey
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background.primary,
  },

  content: {
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    padding: 20,
    backgroundColor:
      Colors.background.secondary,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },

  /* FORM */

  form: {
    padding: 20,
    gap: 12,
  },

  /* COVER */

  imagePicker: {
    height: 190,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor:
      Colors.background.secondary,
  },

  cover: {
    width: "100%",
    height: "100%",
  },

  imageText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },

  /* INPUT */

  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor:
      Colors.background.secondary,
    color: Colors.text.primary,
    fontSize: 14,
  },

  description: {
    height: 100,
    textAlignVertical: "top",
  },

  /* DATES */

  dateRow: {
    flexDirection: "row",
    gap: 8,
  },

  date: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 14,
    backgroundColor:
      Colors.background.secondary,
  },

  dateText: {
    color: Colors.text.primary,
    fontSize: 14,
  },

  /* LOCATION */

  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 4,
  },

  locationWrapper: {
    position: "relative",
  },

  locationLoader: {
    position: "absolute",
    right: 14,
    top: 14,
  },

  /* SUGGESTIONS */

  suggestionsContainer: {
    marginTop: -4,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  suggestionDot: {
    color: Colors.primary.main,
    fontSize: 10,
  },

  suggestionContent: {
    flex: 1,
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },

  suggestionAddress: {
    fontSize: 12,
    color: "#777777",
    marginTop: 3,
    lineHeight: 17,
  },

  /* SELECTED LOCATION */

  selectedLocation: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: Colors.border.light,
  },

  selectedLocationLabel: {
    fontSize: 11,
    color: "#777777",
    marginBottom: 4,
  },

  selectedLocationText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: "600",
    lineHeight: 18,
  },

  /* BUTTON */

  button: {
    backgroundColor:
      Colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});