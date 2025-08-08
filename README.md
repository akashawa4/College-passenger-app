# BusTracker - Passenger App

A real-time bus tracking application for passengers built with React Native and Expo.

## Features

- Real-time bus tracking
- Google authentication
- User profile management
- Route information
- Interactive maps

## Google Sign-In Implementation

The app currently uses Firebase Authentication for Google sign-in. The implementation supports both web and native platforms:

### Web Platform
- Uses Firebase's `signInWithPopup` method
- Works with the configured Firebase project
- Supports popup-based authentication

### Native Platform (iOS/Android)
- Currently uses the same web-based approach as a fallback
- This is a temporary solution until proper native OAuth is configured
- For production, you should implement proper native Google sign-in using `expo-google-app-auth`

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser or on your device using Expo Go.

## Troubleshooting Google Sign-In

### Common Issues

1. **Popup Blocked**: If you see "popup was blocked" error, make sure to allow popups for the site.

2. **Network Errors**: Check your internet connection and try again.

3. **Authentication Failed**: 
   - Verify that the Firebase configuration is correct
   - Check that Google sign-in is enabled in your Firebase project
   - Ensure the domain is authorized in Firebase console

### Firebase Configuration

The app uses the following Firebase configuration:
- Project ID: `college-bus-tracking-d0cd5`
- Auth Domain: `college-bus-tracking-d0cd5.firebaseapp.com`

### For Production

To implement proper native Google sign-in:

1. Set up Google OAuth client IDs for iOS and Android
2. Configure `expo-google-app-auth` plugin in `app.json`
3. Update the `AuthContext.tsx` to use native Google sign-in for mobile platforms

## Development

- The app uses Expo Router for navigation
- Firebase is used for authentication and data storage
- React Native Maps is used for map functionality
- Toast messages provide user feedback

## File Structure

```
project/
├── app/                    # Expo Router pages
├── components/             # Reusable components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── services/              # Firebase and other services
└── assets/                # Images and static files
```
