import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { ThemedText } from "../ThemedText";
import SpeakerSvg from "../../assets/svg/SpeakerSvg";
import TimingBellActive from "../../assets/svg/TimingBellActiveSvg";
import TimingBellUnactiveSvg from "../../assets/svg/TimingBellUnactiveSvg";
import MinScroll from "../MinScroll";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearAllNotificationsAndSound,
  scheduleNotification,
  registerForPushNotificationsAsync,
} from "../notificationService";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useTheme } from "../../context/ThemeContext";
import { AdhanSoundData } from "../services/FirebaseService";

export default function ActiveTimingNotification() {
  const { theme } = useTheme();
  const {
    notification,
    timingSelected,
    notificationStatus,
    changeNotificationStatus,
    adhanSounds,
  } = useGlobalContext();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [isAdhanSoundModalVisible, setAdhanSoundModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  const closeModal = () => {
    setAdhanSoundModalVisible(false);
  };

  useEffect(() => {
    async function getToken() {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    }
    getToken();
  }, [notificationStatus, timingSelected.name]);

  useEffect(() => {
    if (isAdhanSoundModalVisible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(modalAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [isAdhanSoundModalVisible]);

  const color = theme === "light" ? "#000" : "#FFF";
  const colorSubtitle =
    theme === "light" ? "rgba(92, 92, 92, 1)" : "rgba(255, 255, 255, .6)";

  const updateNotificationStatus = async (
    status: string = notificationStatus[timingSelected.name].status,
    adhan: string = notificationStatus[timingSelected.name].adhan
  ) => {
    await clearAllNotificationsAndSound();
    changeNotificationStatus(timingSelected.name, status, adhan);

    if (notification) {
      if (status === "active") {
        AsyncStorage.setItem("isadhan", "active");
        await scheduleNotification(
          `${timingSelected.name} Time!`,
          "This is an example notification",
          false
        );
      } else if (status === "activeAdan") {
        console.log("activeAdan");

        AsyncStorage.setItem("isadhan", "activeAdan");
        await scheduleNotification(
          `${timingSelected.name} Adhan Notification`,
          "Adhan and notification are active.",
          true,
          adhan || 'Mishari.wav'
        );
      } else {
        AsyncStorage.setItem("isadhan", "inactive");
      }
    } else {
      AsyncStorage.setItem("isadhan", "inactive");
    }
  };

  // get adhan sound from nullable id. If id is null, use default id `Ake84ItBS8lAcQ7qlNbA`
  const getAdhanSoundFromUrl = (url: string | null) => {
    const unwrappedUrl =
      url || 'Mishari.wav';
    return adhanSounds.find((adhan) => adhan.sound === unwrappedUrl);
  };

  const onAdhanSoundItemPressed = (item: AdhanSoundData) => {
    setAdhanSoundModalVisible(false);
    updateNotificationStatus("activeAdan", item.sound);
  };

  const renderItem = ({ item }: { item: AdhanSoundData }) => (
    <TouchableOpacity
      onPress={() => onAdhanSoundItemPressed(item)}
      style={[
        styles.adhanSoundItem,
        {
          backgroundColor: Colors[theme].opacityBtn,
          borderColor: Colors[theme].borderColor,
          borderWidth: 2,
        },
      ]}
    >
      <View>
        <ThemedText style={styles.adhanSoundText}>{item.name}</ThemedText>
        <View style={styles.countryContainer}>
          <Image
            source={{ uri: item.country.flag }}
            style={styles.flagImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.countryText}>
            {item.country.name}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const modalScale = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <View>
      <Text style={[{ color: Colors[theme].focusColor }, styles.textSelected]}>
        {timingSelected.name} Time
      </Text>
      <ThemedText style={styles.title}>Notifications & Adhan</ThemedText>

      <View style={styles.statusCont}>
        <TouchableOpacity
          onPress={() => updateNotificationStatus("unactive")}
          style={[
            styles.statusOption,
            { backgroundColor: Colors[theme].opacityBtn },
            notificationStatus[timingSelected.name]?.status === "unactive"
              ? { borderColor: Colors[theme].focusColor }
              : { borderColor: Colors[theme].opacityBtn },
          ]}
        >
          <TimingBellUnactiveSvg
            fill={
              notificationStatus[timingSelected.name]?.status === "unactive"
                ? Colors[theme].focusColor
                : color
            }
          />
          <ThemedText
            style={[
              styles.statusTitle,
              notificationStatus[timingSelected.name]?.status === "unactive"
                ? { color: Colors[theme].focusColor }
                : null,
            ]}
          >
            Silent
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>
            No notifications
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>or adhans.</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateNotificationStatus("active")}
          style={[
            styles.statusOption,
            { backgroundColor: Colors[theme].opacityBtn },
            notificationStatus[timingSelected.name]?.status === "active"
              ? { borderColor: Colors[theme].focusColor }
              : { borderColor: Colors[theme].opacityBtn },
          ]}
        >
          <TimingBellActive
            fill={
              notificationStatus[timingSelected.name]?.status === "active"
                ? Colors[theme].focusColor
                : color
            }
          />
          <ThemedText
            style={[
              styles.statusTitle,
              notificationStatus[timingSelected.name]?.status === "active"
                ? { color: Colors[theme].focusColor }
                : null,
            ]}
          >
            Notifications
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>
            Banner notification only
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>
            (with default sound).
          </ThemedText>
          <ThemedText style={styles.statusSubtitle}>No Adhan.</ThemedText>
        </TouchableOpacity>
      </View>

      {timingSelected.name !== "Sunrise" && (
        <>
          <TouchableOpacity
            onPress={() => updateNotificationStatus("activeAdan")}
            style={[
              { backgroundColor: Colors[theme].opacityBtn },
              styles.notificationSelected,
              notificationStatus[timingSelected.name]?.status === "activeAdan"
                ? { borderColor: Colors[theme].focusColor }
                : { borderColor: Colors[theme].opacityBtn },
            ]}
          >
            <SpeakerSvg
              fill={
                notificationStatus[timingSelected.name]?.status === "activeAdan"
                  ? Colors[theme].focusColor
                  : color
              }
            />
            <View style={{ marginLeft: 5, flex: 1 }}>
              <ThemedText
                style={[
                  styles.notificationName,
                  notificationStatus[timingSelected.name]?.status ===
                  "activeAdan"
                    ? { color: Colors[theme].focusColor }
                    : null,
                ]}
              >
                Adhan + Notification
              </ThemedText>
              <ThemedText
                style={[{ color: colorSubtitle }, styles.notificationSubtitle]}
              >
                Adhan{" "}
                <Text style={{ fontWeight: "900" }}>
                  {getAdhanSoundFromUrl(
                    notificationStatus[timingSelected.name]?.adhan
                  )?.name || "Mishari Rashid al-Afasy"}
                </Text>{" "}
                + banner notification.
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAdhanSoundModalVisible(true)}
            style={styles.changeAdhanButton}
          >
            <ThemedText style={styles.changeAdhanButtonText}>
              Select Adhan Sound
            </ThemedText>
          </TouchableOpacity>

          <View
            style={{
              opacity:
                notificationStatus[timingSelected.name].status !== "unactive"
                  ? 1
                  : 0.06,
              marginTop: 27,
            }}
          >
            <ThemedText style={styles.ReminderText}>
              Pre-Adhan Reminder
            </ThemedText>
            <MinScroll data={timingSelected} />
          </View>
        </>
      )}

      <Modal
        transparent={true}
        visible={isAdhanSoundModalVisible}
        onRequestClose={closeModal}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: Colors[theme].background,
                    transform: [{ scale: modalScale }],
                  },
                ]}
              >
                <ThemedText style={styles.modalTitle}>
                  Select Adhan Sound
                </ThemedText>
                <FlatList
                  data={adhanSounds}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.name}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.listContainer}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  countryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  flagImage: {
    width: 16,
    height: 12,
    marginRight: 6,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 12,
    opacity: 0.6,
  },
  textSelected: {
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 16,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  statusCont: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
  },
  statusOption: {
    backgroundColor: "#07513E",
    borderWidth: 2,
    paddingVertical: 30,
    width: "47%",
    borderRadius: 12,
    alignItems: "center",
  },
  notificationSelected: {
    height: 79,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    marginTop: 16,
    borderWidth: 2,
  },
  notificationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  notificationSubtitle: {
    fontSize: 12,
  },
  ReminderText: {
    marginBottom: 16,
    fontWeight: "500",
  },
  changeAdhanButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  changeAdhanButtonText: {
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "left",
  },
  listContainer: {
    paddingBottom: 16,
  },
  adhanSoundItem: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    justifyContent: "center",
  },
  adhanSoundText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
