# CreditoYa Web Application (v2)

This repository contains the source code for the CreditoYa web application (v2), a platform built with Next.js and TypeScript. It's designed to be a progressive web app (PWA) and can also be bundled as a native mobile application using Capacitor.

## Project Overview

CreditoYa is a financial services platform. This codebase represents its second version, focusing on providing a modern, responsive user experience for accessing these services.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v15.3.0)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:**
    *   [React](https://reactjs.org/) (v19)
    *   [Tailwind CSS](https://tailwindcss.com/) (v4)
    *   [Lucide React](https://lucide.dev/guide/packages/lucide-react) (for icons)
*   **API Communication:** [Axios](https://axios-http.com/)
*   **Mobile Bundling:** [Capacitor](https://capacitorjs.com/) (for Android and iOS)
*   **Key Libraries:**
    *   `@vercel/speed-insights`: Performance monitoring.
    *   `driver.js`: For guided tours and feature introductions.
    *   `js-cookie`: Client-side cookie management.
    *   `jwt-decode`: Decoding JSON Web Tokens.
    *   `pako`: zlib compression/decompression.
    *   `react-select`: Enhanced select input components.
    *   `react-signature-canvas`: For capturing user signatures.
    *   `sonner`: Toast notifications.
*   **Linting:** [ESLint](https://eslint.org/)
*   **Package Manager:** npm (inferred from `package-lock.json`)

## Project Structure

*   `src/app/`: Main application code, following Next.js App Router conventions.
    *   `api/`: Backend API route handlers.
    *   `auth/`: Authentication related pages and components.
    *   `panel/`: User dashboard/panel sections.
*   `src/components/`: Reusable React components.
*   `src/context/`: React Context providers (e.g., `AuthContext`, `DarkModeContext`).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and libraries (e.g., `api-client.ts`).
*   `public/`: Static assets.
*   `android/`, `ios/`: Capacitor native project folders (generated).
*   `mobile-dist/`: Output directory for mobile builds (used by Capacitor).

## Getting Started

### Prerequisites

*   Node.js (check `package.json` for engine specifics, or use a recent LTS version)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd creditoya_web_v2
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the web application in development mode (with Turbopack):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result. The page auto-updates as you edit files.

### Building for Production

**Web Application:**

To create a production build for the web:

```bash
npm run build
```

This will generate an optimized build in the `.next` directory. To run this build locally:

```bash
npm run start
```

**Mobile Application (Capacitor):**

1.  Build the web assets specifically for mobile (outputs to `mobile-dist/`):
    ```bash
    npm run build:mobile
    ```
    *(Note: This script uses `next.config.mobile.js`, which might contain specific configurations for the mobile build.)*

2.  Sync the web assets with the native Capacitor projects:
    ```bash
    npx cap sync
    ```

3.  Open the native project in its IDE:
    *   For Android:
        ```bash
        npx cap open android
        ```
    *   For iOS:
        ```bash
        npx cap open ios
        ```
    Then, build and run from Android Studio or Xcode.

## Scripts

Key scripts available in `package.json`:

*   `npm run dev`: Starts the Next.js development server with Turbopack.
*   `npm run build`: Creates a production build of the Next.js web application.
*   `npm run build:mobile`: Creates a production build specifically for Capacitor (outputs to `mobile-dist/`).
*   `npm run start`: Starts the Next.js production server after a build.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run cap:sync`: Convenience script that runs `build:mobile` then `npx cap sync`.
*   `npm run cap:android`: Runs `cap:sync` then opens the Android project.
*   `npm run cap:ios`: Runs `cap:sync` then opens the iOS project.

## Linting

This project uses ESLint for code quality. Run the linter with:

```bash
npm run lint
```

Ensure there are no linting errors before committing changes.

## Configuration Files

*   `next.config.ts`: Main Next.js configuration.
*   `next.config.mobile.js`: (Assumed) Next.js configuration for mobile builds.
*   `capacitor.config.ts`: Capacitor configuration, including app ID and server settings.
*   `tsconfig.json`: TypeScript compiler options.
*   `postcss.config.mjs`, `tailwind.config.js` (Implicit, based on `tailwindcss` dependency): Configuration for Tailwind CSS.
*   `eslint.config.mjs`: ESLint configuration.

## Deployment

*   **Web:** The `next.config.ts` specifies `output: 'standalone'`, suggesting deployments as a standalone Node.js server. The original README also mentioned Vercel.
*   **Mobile Backend/API:** The `capacitor.config.ts` points to a server URL at `https://creditoya-superapp-beta-894489564991.us-central1.run.app`, likely a Google Cloud Run deployment for backend services used by the mobile app.

## Further Learning (Next.js)

*   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
*   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

---

*This README provides a technical overview for developers. For user-facing information about CreditoYa, please refer to the application's official website or contact the CreditoYa team.*
