# Data Schema and Persistence

## Current State

MyHack does not currently define a relational schema or local Prisma model. The active persistence layer is Firebase Firestore through `lib/firebase.ts`.

The project also initializes Firebase Auth, but there is no implemented login UI or auth flow yet.

## Firebase Configuration

`lib/firebase.ts` initializes Firebase from public environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Exports:

- `db`: Firestore instance
- `auth`: Firebase Auth instance
- `saveResult(collectionName, data)`: helper that inserts a document and adds `createdAt: serverTimestamp()`

## Known Data Shapes

The TypeScript data shapes currently live in `lib/types.ts`.

```ts
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ResultType {
  id?: string;
  title: string;
  data: unknown;
  createdAt: unknown;
}

export interface AppState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  user: unknown | null;
  setUser: (user: unknown | null) => void;
}
```

## Firestore Collections

No fixed Firestore collection names have been committed yet.

`saveResult(collectionName, data)` allows feature code to choose the collection dynamically. Until the hackathon topic is locked, all new collection names must be documented here before use.

Recommended initial conventions:

- `aiResults`: AI-generated structured outputs
- `sessions`: user or demo sessions
- `messages`: chat-style user/assistant message records

## Security Rules

`firestore.rules` currently allows reads and writes only for authenticated users:

```js
allow read, write: if request.auth != null;
```

This is acceptable for a scaffold, but the final product should narrow rules by collection, owner, and role once the data model is known.

## Schema Gaps

- No final product domain schema exists yet.
- `ResultType.data` and `saveResult(data)` are intentionally broad until a product schema is chosen.
- Auth is initialized but not wired to UI.
- Collection naming and access rules must be finalized after topic drop.
