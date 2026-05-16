# Server Actions and API Contracts

## Current Backend Surface

The project currently has one implemented server API route:

- `POST /api/ai`

There are no Next.js server actions yet.

## `POST /api/ai`

Source: `app/api/ai/route.ts`

### Purpose

Proxy a prompt to Gemini from the server so the API key stays out of the browser bundle.

### Request

```ts
{
  prompt: string;
}
```

### Response: Success

```ts
{
  text: string;
}
```

### Response: Missing Prompt

HTTP status: `400`

```ts
{
  error: "Prompt is required";
}
```

### Response: Gemini or Server Failure

HTTP status: `500`

```ts
{
  error: "Failed to generate content";
}
```

### Side Effects

- Calls Gemini model `gemini-3-flash-preview`.
- Reads `GEMINI_API_KEY` from server environment.
- Logs Gemini API errors to the server console.
- Does not write to Firestore.

### Last Verified

2026-05-15, based on current source.

## Gemini Helper Contracts

Source: `lib/gemini.ts`

### `generateContent(prompt: string): Promise<string>`

Calls Gemini 3 Flash Preview and returns text.

### `analyzeWithGemini(input: string, outputSchema?: string): Promise<unknown>`

Calls Gemini 3 Flash Preview with `responseMimeType: "application/json"`, attempts to parse the response as JSON, and returns either parsed data or an error wrapper:

```ts
{
  error: "Failed to parse AI response";
  raw: string;
}
```

### Side Effects

- Calls Gemini.
- Logs JSON parse failures to the server console.
- Does not write to Firestore.

## Firebase Helper Contracts

Source: `lib/firebase.ts`

### `saveResult(collectionName: string, data: Record<string, unknown>)`

Writes a document to the requested Firestore collection and adds `createdAt: serverTimestamp()`.

### Side Effects

- Creates a Firestore document.
- Uses the active Firebase app initialized from public Firebase environment variables.

## Contract Gaps

- The AI route returns raw text, while `analyzeWithGemini` supports structured JSON. The app has not yet unified these paths.
- There is no client UI wired to `POST /api/ai`.
- There are no auth routes or server actions yet.
- Firestore writes are possible through `saveResult`, but no feature currently calls it.
