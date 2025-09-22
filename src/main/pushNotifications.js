import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabaseClient';

export const initializePushNotifications = async () => {
  try {
    console.log('🚀 PUSH NOTIFICATIONS FUNCTION CALLED!');
    console.log('Initializing push notifications...');
    console.log('CONSOLE: initializePushNotifications() was called!');

    // Check if PushNotifications is available
    if (!PushNotifications) {
      console.error('ERROR: PushNotifications plugin not available!');
      return;
    }

    // Set up listeners FIRST, before registering
    console.log('Setting up push notification listeners...');

    PushNotifications.addListener('registration', async (token) => {
      console.log('🎉 PUSH TOKEN RECEIVED!');
      console.log('Push registration success, token: ' + token.value);
      console.log('Token length:', token.value.length);

      // Get the current user from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (user && !userError) {
        // Store the push token in Supabase users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ push_token: token.value })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Error storing push token:', updateError);
        } else {
          console.log('✅ Push token stored successfully in Supabase!');
          console.log('User ID:', user.id);
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

    // Now request permissions and register AFTER listeners are set up
    let permStatus = await PushNotifications.requestPermissions();

    // Wait a moment for iOS to process the permission, then check actual status
    await new Promise(resolve => setTimeout(resolve, 1000));
    let currentStatus = await PushNotifications.checkPermissions();

    // Since permissions are enabled in iOS Settings but plugin returns undefined,
    // let's try to register anyway (iOS will reject if not actually permitted)
    console.log('🚀 Attempting registration despite undefined permission status...');

    try {
      await PushNotifications.register();
      console.log('📱 Registration request sent to Apple');

      // Set a timeout to check if token never arrives
      setTimeout(() => {
        console.log('DEBUG: 10 seconds passed, no token received. This indicates either Apple Push service is not responding or permissions are actually denied.');
      }, 10000);
    } catch (registerError) {
      console.error('Registration error:', registerError);
      return;
    }

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