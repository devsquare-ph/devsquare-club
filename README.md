# DevSquare Club

A Firebase-powered web application that showcases member profiles and achievement badges with comprehensive admin functionality for member management.

## Overview

DevSquare Club is a platform designed to display member profiles and their earned badges. The application includes authentication, member management, badge assignment, and an admin panel for overseeing all aspects of the community.

## Features

1. **User Authentication**
   - Secure sign-up and login functionality
   - Role-based access control (Admin/Member)
   - Firebase Authentication integration

2. **Member Profiles**
   - Customizable profiles with name, email, and profile picture (consider the data models)
   - Detailed member bio and information
   - Public member directory

3. **Badges System**
   - Admin-assigned achievement badges
   - Badge display on member profiles
   - Badge categories and levels

3. **Projects System**
   - Admin-assigned projects
   - Projects display on member profiles
   - Projects categories and levels

4. **Admin Panel**
   - Comprehensive member management (Add/Edit/Delete)
   - Badge assignment and removal
   - User role management
   - Analytics dashboard


## Data Models

- Users
    - uid
    - email
    - member_since
    - created_date
    - modified_date
    - profile_image
    - github_handle
    - linkedin_profile_link
    - facebook_handle
    - instagram_handle
    - role
    - badges
    - projects

- Badges
    - uid
    - name
    - level
    - description
    - created_date
    - modified_date
    - image
    - is_active

- Projects
    - uid
    - title
    - description
    - categories
    - tags
    - technology_stacks
    - created_date
    - modified_date
    - links (array_string)
    - image
    - is_active


- Technology_stacks
    - uid
    - name
    - description
    - image
    - created_date
    - modified_date
    - is_active

## Technologies

- **Frontend**:
  - React
  - Next.js
  - TypeScript
  - Tailwind CSS

- **Backend**:
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage
  - Firebase Cloud Functions
  - Cloudinary for image cdn

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/devsquare-club.git
   cd devsquare-club
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

4. Add a web app to your Firebase project and get your configuration

5. Set up a Cloudinary account at [Cloudinary Console](https://cloudinary.com/console)
   - Create an unsigned upload preset named `devsquare_profiles` (use underscores, not hyphens)
     - Go to Settings > Upload > Upload presets
     - Click "Add upload preset"
     - Set "Signing Mode" to "Unsigned"
     - Set folder to "devsquare-profiles" (optional)
     - Save the preset with the name "devsquare_profiles"

6. Create a `.env.local` file in the root directory with your Firebase and Cloudinary configuration:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

7. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser


## Deployment

This application can be deployed on Vercel or Firebase Hosting:

```bash
# Deploy to Vercel
vercel

# Deploy to Firebase Hosting
firebase deploy
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
