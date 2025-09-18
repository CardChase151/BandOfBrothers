import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabaseClient';

export const initializePushNotifications = async () => {
  try {
    console.log('Initializing push notifications...');

    // Request permission to use push notifications
    // iOS will show a prompt asking for permission
    let permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      console.log('Push notification permissions granted');

      // Register with Apple Push Notification service
      // This will return a device token
      await PushNotifications.register();
    } else {
      console.log('Push notification permissions denied');
      return;
    }

    // Listen for registration events
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);

      // Get the current user from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (user && !userError) {
        // Store the push token in Supabase users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ push_token: token.value })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error storing push token:', updateError);
        } else {
          console.log('Push token stored successfully');
        }
      } else {
        console.error('No authenticated user found:', userError);
      }
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notification received (when app is open)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);

      // Handle notification received while app is in foreground
      // Could show in-app notification or update UI
    });

    // Listen for push notification action performed (when user taps notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification);

      // Handle deep linking here
      // notification.notification.data will contain custom data like chat_id
      const chatId = notification.notification.data?.chat_id;

      if (chatId) {
        // Navigate to specific chat
        // You could dispatch a custom event or use navigation here
        console.log('Should navigate to chat:', chatId);

        // Example: Dispatch custom event for navigation
        window.dispatchEvent(new CustomEvent('navigate-to-chat', {
          detail: { chatId }
        }));
      }
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

// Function to get current push token if needed elsewhere
export const getCurrentPushToken = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error getting push token:', error);
        return null;
      }

      return data?.push_token;
    }
  } catch (error) {
    console.error('Error getting current push token:', error);
    return null;
  }
};