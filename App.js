import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions'; // this is for ios

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    };
  }
});

export default function App() {

  const [pushToken, SetPushToken] = useState();

  useEffect(() => {                                                                                  //this is for ios
    Notifications.getPermissionsAsync(Permissions.NOTIFICATIONS).then((statusObj) => {                          //Permissions.getAsync()
      if (statusObj.status !== 'granted') {
        return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      return statusObj;
    }).then((statusObj) => {
      console.log(statusObj);
      if (statusObj.status !== 'granted') {
        throw new Error('Permission not granted!');
      }
    })
      .then(() => {
        return Notifications.getExpoPushTokenAsync();
      })
      .then(response => {
        const token = response.data;
        SetPushToken(token);
      })
      .catch(err => {
        console.log(err);
        return null;
      });
  }, [])

  useEffect(() => {
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  const triggerNotificationHandler = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: 'my first local notification',
    //     body: 'this is first notification',  // there are many many options here 
    //     data: { mySpecialData: 'Some Text test' }
    //   },
    //   trigger: {
    //     seconds: 10
    //   }
    // });


    fetch('https://exp.host/--/api/v2/push/send', {             //expo push notif server url
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: 'Some data' },
        title:'Sent via the app',
        body:'this push notification was send via the app!',
      })
    });;
  };

  return (
    <View style={styles.container}>
      <Button title="trigger notification" onPress={triggerNotificationHandler} />
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
