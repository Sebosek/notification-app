import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useCallback, useEffect, useRef, useState} from "react";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener, 
  setNotificationHandler,
  scheduleNotificationAsync,
  Subscription,
  Notification, 
  removeNotificationSubscription, 
  getPermissionsAsync, 
  requestPermissionsAsync,
} from "expo-notifications";
import dayjs from "dayjs/esm";


setNotificationHandler({
  handleNotification: async (notification: Notification) => {
    console.log("[NotificationHandler] received notification");

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get notification permissions!');
    return;
  }
};

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    requestNotificationPermissions().finally(() => console.log("Permissions requested"));
    
    notificationListener.current = addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      removeNotificationSubscription(notificationListener.current!);
      removeNotificationSubscription(responseListener.current!);
    };
  }, []);
  
  const handleNotification = useCallback(async () => {
    const date = dayjs().add(1, 'minute').toDate();

    await scheduleNotificationAsync({
      content: {
        title: "You've got mail after a minute! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here' },
      },
      trigger: { date },
    });
  }, []);
  
  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <Text>Your expo push token: {expoPushToken}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>
        <Button
          title="Press to schedule a notification"
          onPress={handleNotification}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
