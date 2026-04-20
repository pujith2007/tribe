# Creative Pulse

Creative Pulse is a React web application for creative individuals who want to document daily progress, stay accountable with peers, and turn small creative wins into visible momentum.

## Problem and target users

Many creative people struggle to stay consistent because their progress is private, irregular, and easy to underestimate. This product is aimed at artists, designers, writers, photographers, video creators, and other makers who benefit from:

- a daily progress-sharing habit
- a community feed for support and accountability
- simple metrics that help them reflect on consistency

## Tech choices

- React with functional components for a modern, interview-friendly component model
- React Router for navigation between login, feed, profile, and settings
- Context API for global auth and app preferences
- `useState` for forms and interaction state
- `useEffect` for Firebase auth subscriptions and feed/profile data loading
- Firebase Authentication for email/password and Google login
- Firestore for profiles, posts, comments, likes, shares, and follows
- Firebase Storage for uploaded creative images
- Plain CSS for a calm, responsive light/dark design without hiding decisions behind a UI library

## Folder structure

```text
src/
  components/
  context/
  hooks/
  pages/
  services/
```

## Features delivered

- Authentication with email/password and Google sign-in
- Tutorial walkthrough for first-time users
- Main feed with image posts
- Like, comment, share, follow, and delete interactions
- Profile page with weekly uploads, likes, and views
- Settings page for profile edits and app preferences
- Light and dark themes
- Responsive layout, loading states, and error handling

## Firebase setup

1. Create a Firebase project.
2. Enable Authentication:
   - Email/Password
   - Google
3. Create Firestore Database.
4. Enable Firebase Storage.
5. Copy `.env.example` to `.env` and fill in the Firebase credentials.
6. Install dependencies:

```bash
npm install
```

7. Start the app:

```bash
npm run dev
```

## Suggested Firestore collections

- `profiles/{userId}`
- `posts/{postId}`
- `posts/{postId}/comments/{commentId}`

## Viva-friendly explanation points

- `AuthContext` centralizes session state so route protection and user data stay consistent.
- `AppContext` manages global preferences like theme and tutorial state.
- `services/authService.js` isolates Firebase authentication logic from UI components.
- `services/dataService.js` isolates CRUD logic for posts, comments, follows, and profiles.
- `ProtectedRoute` keeps authenticated pages secure.
- `FeedPage` demonstrates `useEffect` with a real-time Firestore subscription.
- `SettingsPage` shows controlled forms with `useState`.
- `PostCard` demonstrates prop-driven composition and localized interaction state.

## Submission checklist

- README included
- Firebase-backed backend integration included
- Routing, context, hooks, and CRUD flows included
- Responsive light/dark UI included
- Ready for demo recording after Firebase credentials are added

## Recommended final submission steps

1. Deploy to Vercel or Netlify.
2. Record a short demo video covering login, tutorial, posting, liking, commenting, follow, profile stats, settings, and theme switching.
3. Keep a small viva script explaining why React Router, Context API, and Firebase were chosen.
4. Add the live deployment link and demo link in your submission document.
