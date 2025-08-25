# SoMap – Social Mapping App

SoMap is a React Native mobile app that allows professionals to discover and connect with other users on a map, start conversations, and manage their profile. The app uses Firebase for authentication, real-time chat, and user location tracking.

---

## Prerequisites

Make sure you have Node.js installed. You also need npm or yarn and Expo CLI installed globally (`npm install -g expo-cli`). You can run the app on Expo Go or through Expo Snack.

---

## Running the App

To run locally, clone the repository, install dependencies using `npm install`, and start the app with `npx expo start`. You can open the app on your phone using Expo Go or a simulator. Alternatively, you can use the Expo Snack link by scanning the QR code to run the app directly.

---

## Authentication

Users can sign up with email and password. For testing, you can use the pre-configured main user:

Email: 111@1.com  
Password: 666666

---

## App Features

- **Home:** View other users on the map and start a conversation by tapping their marker.  
- **Profile & Profile Settings:** View and edit your bio, job, and interests.  
- **Chat List & Chat Rooms:** Access chat rooms you participate in and send messages in real-time.

---

## Testing Chat Functionality

To test chat, log in with two accounts on separate devices or simulators. Navigate to the Home screen and tap a user's marker to start a conversation. Messages should sync in real-time between the two accounts.

---

## Preloaded Users

Three accounts are pre-set around Piccadilly Circus, British Museum, and Goldsmith. These users are forced online in Firestore to allow markers to be visible on the map and make it easy to test the app from the London area.




