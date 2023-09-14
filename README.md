# SecurChat

## Overview

SecurChat is an in-development chat application focused on providing end-to-end encryption. The application is built using Angular and Firebase.

### Current Features
- Create a new chat channel
- Store JWT tokens locally for authentication
- Send messages within a channel
- Generate a raw link to a specific chat channel

### Upcoming Features
- Implement one-time JWT tokens to allow other users to join a channel
- Enable end-to-end encryption

## Installation and Setup

### Prerequisites
- Node.js and npm
- Angular CLI
- Firebase CLI (for deployment)

### Firebase Setup

1. Copy `src/app/firebase/firebase.config.example.ts` to a new file and rename it to `./firebase.config.ts`.
2. Replace the placeholder values with your Firebase configuration.

### Running the Project

#### Using Angular Development Server

Execute `ng serve` to start the Angular development server. Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload upon saving changes.

#### Using Firebase Hosting

To use Firebase Hosting, first install the Firebase CLI if you haven't:

```npm install -g firebase-tools```

then

```firebase deploy```

## Live Demo

A demo of the app is hosted at [SecurChat Demo](https://securr-chat.web.app/home). Note that the demo currently lacks user authentication, so all permissions are restricted.
