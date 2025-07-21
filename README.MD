# Insurance Claim Flow Application for Elcare

## Introduction

This repository contains a full-stack application designed to handle insurance claim process. It allows a user to manage their repair case by selecting a service option and completing a mock payment. The application is built using a client-server architecture with a standalone Node.js backend and a Next.js frontend.

## Features

* **Dynamic Case Handling:** The application is accessed via a unique `/en/{guid}` route that fetches and displays the case data.
* **Service Option Selection:** User can choose between available service options. The "Swap" option is conditionally enabled based on a realtime SOAP API stock check.
* **State Persistence:** The user's progress is automatically saved to `localStorage`, allowing them to close the tab and seamlessly resume their claim.
* **Mock Payment Flow:** A complete payment flow with price calculation, multiple payment method options (Card & Swish), and simulated success/failure responses.
* **Internationalization (i18n):** Built with `next-intl` to be fully multilingual.
* **Robust Error Handling:** Handles API errors like "Case Not Found" and external service failures.

## Architecture

The project is structured as a **pnpm monorepo** containing two applications: a `server` and a `client` for the sake of **client-server separation**.

### Backend (`/server`)

The backend is a lightweight **Node.js/Express** application that acts as a secure **API Gateway**. Its sole responsibility is to be an intermediary between the client and the external, third-party services. This separation is secure, as it ensures that sensitive credentials (like the `accessToken` for the case API and the credentials for the SOAP API) are never exposed to frontend/browser.

### Frontend (`/client`)

The frontend is a **Next.js** application. It is a robust application that prioritizes **Client-Side Rendered (CSR)** feel.

The core architectural pattern is quite simple:

* **The Page (`/app/[locale]/[guid]/page.tsx`):** This component owns the application state (`useState`) and contains all the critical logic for fetching data, initializing the state (either fresh or from `localStorage`), and persisting changes.
* **The Provider (`/context/CaseContext.tsx`):** The React Context provider receives the state from the `CasePage` and pass it down to any component that needs it.

### State Management & Persistence

State is managed by a combination of `useState` and `useContext`.

* **Ownership:** The state is owned by the main `CasePage` component.
* **Initialization:** When the `CasePage` loads, a single `useEffect` hook runs. It fetches the case data and then checks `localStorage` for any saved progress that matches the current case's `guid`. If valid data is found, the state is initialized from storage. If not found, a clean state is created based on the case's `serviceTypeId`.
* **Persistence:** A separate, simple `useEffect` hook in `CasePage` watches for any changes to the `state` object. Whenever the state changes, this effect saves the entire state object to `localStorage` under a key unique to the current `guid`.

### Security Considerations

* **Credential Isolation:** The most important security feature is the client-server architecture. The frontend **never** has access to the `accessToken` or SOAP credentials.
* **Input Validation:** The backend uses the `zod` library to validate incoming parameters. This prevents errors and potential injection attacks.

### Internationalization (i18n)

The application is built to be multilingual using `next-intl`.

* **Routing:** The `middleware.ts` file enforces routing (e.g., `/en/...`).
* **Messages:** All user-facing text is stored in `src/messages/en.json` and accessed using `useTranslations` hook, making it easy to add new languages in the future.
* **Configuration:** The `src/i18n.ts` file sets global defaults for locales and the `timeZone`.

## Tech Stack & Libraries

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **HTTP Client:** `axios` (for calling external APIs)
* **XML Parsing:** `fast-xml-parser` (for handling the SOAP response)
* **Validation:** `zod`
* **Environment:** `dotenv`, `cors`

### Frontend

* **Framework:** Next.js
* **Styling:** Tailwind CSS with `postcss` and `autoprefixer`
* **UI Components:** Headless UI (for accessible `RadioGroup` components)
* **Internationalization:** `next-intl`
* **Client-Side Data Fetching:** `swr` (for the background stock check)
* **HTTP Client:** `axios` (for calling our own backend)

## Project Setup & Installation

### Prerequisites

* Node.js
* pnpm

### 1. Clone & Install

Clone the repository and install all dependencies for both the client and server from the root directory.

```
git clone https://github.com/farhanmaba/elcare-coding-assignment.git
cd elcare-coding-assignment
pnpm install
```

### 2. Set Up Environment Variables

Ask the `.env` files in both the `/server` and `/client` directories from the repository owner to set up environment variables.

### 3. Run the Development Servers

Run the following command from the root directory to start both the backend and the frontend.

```
pnpm dev
```

* The **backend** will be available at `http://localhost:3001`.
* The **frontend** will be available at `http://localhost:3000`.

### 4. Access the Application

Open your browser and navigate to a case URL:

Theft/Lost: `http://localhost:3000/en/a78f77b8-ea3c-4c3b-80e7-428a6a705a99`

Drop-Off: `http://localhost:3000/en/ea1d5e29-9e0d-4ff5-ae4c-197920a7def9`

Swap: `http://localhost:3000/en/cdd33a81-3b3f-4025-8009-327663b1e93c`

#### Note:

Server health check can be done at: `http://localhost:3001/api/health`