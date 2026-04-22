# SupportSync

SupportSync is a full-stack AI customer support chatbot with human handoff, live messaging, and an embeddable website widget. It is built with Next.js, Express, Socket.IO, MongoDB, and Scalekit authentication.

## Live Links

- Main App: [https://agentraxsync.onrender.com](https://agentraxsync.onrender.com)
- Dashboard: [https://agentraxsync.onrender.com/dashboard](https://agentraxsync.onrender.com/dashboard)
- Embed Generator: [https://agentraxsync.onrender.com/embed](https://agentraxsync.onrender.com/embed)

## Features

- AI chatbot for website visitors
- Human agent escalation flow
- Real-time user-agent chat with Socket.IO
- Embeddable widget script for external websites
- Agent dashboard for handling escalated chats
- End chat flow that returns conversation back to AI
- MongoDB-based chat and settings storage
- Scalekit-based authentication

## Tech Stack

- Next.js 14
- React 18
- Express
- Socket.IO
- MongoDB with Mongoose
- Scalekit
- Tailwind CSS
- TypeScript

## Project Structure

```text
agentraxsync/
├─ public/
│  └─ widget.js              # Embeddable chatbot widget
├─ src/
│  ├─ app/
│  │  ├─ api/                # API routes
│  │  ├─ components/         # UI components
│  │  ├─ dashboard/          # Agent/admin dashboard
│  │  ├─ embed/              # Widget embed code page
│  │  └─ chat/               # Demo chat page
│  ├─ lib/                   # DB, auth, helper utilities
│  └─ model/                 # Mongoose models
├─ server.js                 # Custom Express + Next + Socket.IO server
├─ package.json
└─ render.yaml               # Render deployment config
```

## How It Works

1. A visitor opens the website widget and starts chatting.
2. Messages are sent to the AI support API.
3. If the user requests a human or frustration is detected, the system escalates the chat.
4. An agent sees the escalation in the dashboard inbox.
5. The agent accepts the chat and continues the conversation in real time.
6. When the agent ends the chat, the user is notified and the conversation returns to AI mode.

## Local Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd agentraxsync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the project root:

```env
SCALEKIT_ENVIRONMENT_URL=your_scalekit_environment_url
SCALEKIT_CLIENT_ID=your_scalekit_client_id
SCALEKIT_CLIENT_SECRET=your_scalekit_client_secret
MONGODB_URL=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
BASE_URL=http://localhost:3000
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## Embed Widget

After login, open the Embed page and copy the generated script. It will look similar to this:

```html
<script
  src="https://agentraxsync.onrender.com/widget.js"
  data-owner-id="YOUR_OWNER_ID"
  data-api-url="https://agentraxsync.onrender.com/api/chat">
</script>
```

Add it before the closing `</body>` tag on your website.

## Important Pages

- `/` - landing page
- `/dashboard` - chatbot settings dashboard
- `/dashboard/inbox` - escalated chat inbox
- `/embed` - widget embed code page
- `/chat` - demo/test chat page

## Important API Routes

- `POST /api/chat` - chatbot messaging API
- `GET /api/setting` - fetch chatbot settings
- `POST /api/setting` - save chatbot settings
- `GET /api/support/inbox` - fetch escalated chats
- `POST /api/support/inbox/reply` - send agent reply
- `POST /api/support/chat/end` - end active agent chat
- `/api/auth/login` - login flow
- `/api/auth/callback` - auth callback
- `/api/auth/logout` - logout flow

## Deployment

This project is configured for Render using `render.yaml`.

Recommended setup:

- Build command: `npm install && npm run build`
- Start command: `npm start`

Required environment variables on Render:

- `MONGODB_URL`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SCALEKIT_ENVIRONMENT_URL`
- `SCALEKIT_CLIENT_ID`
- `SCALEKIT_CLIENT_SECRET`

## Notes

- Do not commit real API keys or database credentials to GitHub.
- Rotate any secrets that were previously exposed in local files.
- This project uses a custom Node server because Socket.IO is integrated alongside Next.js.

## Author

Built for the SupportSync / AgentraXSync chatbot workflow project.
