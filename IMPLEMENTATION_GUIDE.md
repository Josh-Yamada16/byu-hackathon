# Major Selection Feature - Implementation Guide

## Overview
You've successfully implemented a major selection feature that allows users to click a button on the home page, select their major, and have that information passed to the chatbot on the next page.

## How It Works

### 1. **Home Page (`app/page.tsx`)**
The home page now displays 5 major buttons with different colors:
- Computer Science (Blue)
- Mathematics (Purple)
- Physics (Green)
- Engineering (Orange)
- Biology (Pink)

Each button links to `/chat` with query parameters:
```
/chat?majorId=cs&majorName=Computer%20Science
```

**To add or modify majors**, edit the `majors` array:
```typescript
const majors = [
  { id: 'cs', name: 'Computer Science', color: 'bg-blue-600 hover:bg-blue-700' },
  // Add more majors here...
];
```

### 2. **Chat Page (`app/chat/page.tsx`)**
The chat page now:
- Reads the query parameters using `await searchParams`
- Extracts `majorId` and `majorName`
- Passes them to the `<Chat>` component as props

```typescript
const majorId = typeof params.majorId === 'string' ? params.majorId : undefined;
const majorName = typeof params.majorName === 'string' ? decodeURIComponent(params.majorName) : undefined;
```

### 3. **Chat Component (`components/chat.tsx`)**
The Chat component now:
- Accepts `majorId` and `majorName` as optional props
- Includes them in the request sent to the API
- Passes them via the `prepareSendMessagesRequest` function

```typescript
body: {
  id: request.id,
  message: request.messages.at(-1),
  selectedChatModel: currentModelIdRef.current,
  selectedVisibilityType: visibilityType,
  majorId,          // ← New
  majorName,        // ← New
  ...request.body,
}
```

### 4. **API Route (`app/chat/api/chat/route.ts`)**
The API endpoint now:
- Receives `majorId` and `majorName` from the request body
- Passes them to the `systemPrompt` function

```typescript
const {
  id,
  message,
  selectedChatModel,
  selectedVisibilityType,
  majorId,    // ← New
  majorName,  // ← New
} = requestBody;
```

### 5. **System Prompt (`lib/ai/prompts.ts`)**
The system prompt now customizes itself based on the major:

**Without major selection:**
```
You are a friendly assistant! Keep your responses concise and helpful.
```

**With major selection (e.g., Computer Science):**
```
You are a helpful academic assistant specialized in Computer Science. Help students with questions related to their major, coursework, and career advice in this field. Keep your responses concise and helpful.
```

The customized prompt is used as the system message for the AI model, making the chatbot responses more relevant to the student's major.

## Data Flow Diagram

```
User clicks major button on home page
          ↓
URL: /chat?majorId=cs&majorName=Computer%20Science
          ↓
app/chat/page.tsx (Server Component)
          ↓
Extract majorId & majorName from searchParams
          ↓
Pass to <Chat /> component
          ↓
components/chat.tsx
          ↓
Include in API request body
          ↓
POST /api/chat with { majorId, majorName, ... }
          ↓
app/chat/api/chat/route.ts
          ↓
Pass to systemPrompt() function
          ↓
AI receives customized system prompt based on major
          ↓
More relevant responses for the student's major
```

## Testing the Feature

1. **Start the dev server:**
   ```bash
   pnpm run dev
   ```

2. **Navigate to home page:**
   - Go to `http://localhost:3000`
   - You should see 5 major buttons

3. **Click a major:**
   - Click on "Computer Science" (or any major)
   - You'll be redirected to `/chat?majorId=cs&majorName=Computer%20Science`

4. **Verify major info is passed:**
   - In your browser's Network tab (F12 → Network), click on the first `/api/chat` request
   - Check the "Request" payload to see `majorId` and `majorName` included

5. **Test chatbot behavior:**
   - Ask a CS-related question: "What is Big O notation?"
   - The chatbot should provide CS-specific context in its response
   - Ask a general question: "Tell me a joke"
   - The chatbot will still have CS context in the system prompt

## Optional: Customizations

### Add More Majors
Edit `app/page.tsx`:
```typescript
const majors = [
  { id: 'cs', name: 'Computer Science', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'math', name: 'Mathematics', color: 'bg-purple-600 hover:bg-purple-700' },
  // Add your major here:
  { id: 'newid', name: 'New Major Name', color: 'bg-red-600 hover:bg-red-700' },
];
```

### Display Selected Major in Chat
You can display the selected major in the chat header by storing it in state in `components/chat.tsx`:

```typescript
const [selectedMajor, setSelectedMajor] = useState(majorName || 'General Chat');

return (
  <div>
    <div>Chatting about: {selectedMajor}</div>
    {/* Rest of chat component */}
  </div>
);
```

### Modify System Prompt
Edit `lib/ai/prompts.ts` to customize how the chatbot responds based on the major:

```typescript
let basePrompt = regularPrompt;
if (majorId && majorName) {
  basePrompt = `You are an expert in ${majorName}...`; // Customize here
}
```

### Pass Additional Data
You can extend this pattern to pass any data:
1. Add query params on home page: `/chat?majorId=cs&majorName=CS&year=2024`
2. Read in chat page: `const year = searchParams.year`
3. Pass to Chat component: `<Chat year={year} />`
4. Include in API request body
5. Use in API logic

## Files Modified

- ✅ `app/page.tsx` - Added major selection buttons
- ✅ `app/chat/page.tsx` - Extract and pass query parameters
- ✅ `components/chat.tsx` - Accept and forward majorId/majorName
- ✅ `app/chat/api/chat/route.ts` - Receive and use major info
- ✅ `lib/ai/prompts.ts` - Customize system prompt based on major

## Troubleshooting

**Q: Query parameters not showing up in the request?**
- Check browser console (F12) for errors
- Verify the URL has the query parameters
- Check Network tab to see the request body

**Q: Chatbot not giving major-specific responses?**
- Check that `majorName` is being passed correctly
- Verify the system prompt in the Network tab request
- Try a more specific major-related question

**Q: Major not persisting between messages?**
- This is expected! Query parameters are only used for the initial page load
- If you want to persist it, store in localStorage or a database

---

**You're all set!** 🎉 Users can now select their major and get specialized chatbot assistance.
