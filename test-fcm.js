import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(
  await readFile(new URL('./salah-353f3-firebase-adminsdk-ix17c-22d995c6e2.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount)
});

async function sendTestTopicMessage() {
  try {
    const message = {
      topic: 'test_topic',
      notification: {
        title: 'Test Dua Notification',
        body: 'This is a test notification - ' + new Date().toISOString()
      },
      data: {
        type: 'dua_notification',
        notificationId: 'test-001',
        duaId: 'test-dua-id',           // Make sure this matches a real dua ID in your database
        categoryId: 'test-category-id',  // Make sure this matches a real category ID
        categoryName: 'Test Category',
        scheduledTime: new Date().toISOString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          priority: 'max',
          defaultSound: true,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            mutableContent: true,
            sound: 'default',
            badge: 1,
            category: 'dua_notification'
          }
        }
      }
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent test message:', response);

    // Send a direct message to verify basic setup
    // Uncomment and replace TOKEN with your device token for testing

    const deviceToken = 'et6Vo9-iCUipqBUnJjAWU3:APA91bEQZX9Ctkr4Hopd0YOAyXldcuiUxIZhe4FRPnvVv_38JKK5Wh3k4HflJoLtsPY9Gjy5dp1Qb9BruIoq8yZpgcK2G2ALLeIUQaWBv31DOgVx4qNlKJg';
    const directMessage = {
      ...message,
      token: deviceToken,  // Use token instead of topic
    };
    delete directMessage.topic;  // Remove topic when sending direct message
    
    const directResponse = await getMessaging().send(directMessage);
    console.log('Successfully sent direct message:', directResponse);


  } catch (error) {
    console.error('Error sending test message:', error);
    if (error.errorInfo) {
      console.error('Error details:', error.errorInfo);
    }
  }
}

// Run the test
sendTestTopicMessage();