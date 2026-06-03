# Smart Campus Communication App

A full-stack WhatsApp clone built with React, Node.js, Express, and Socket.io, featuring a smart **AI-powered Notice Board** powered by LLaMa 3.3 via Groq.

## Project Structure
- `frontend/` - React, Vite, Tailwind CSS, Framer Motion
- `backend/` - Node.js, Express, SQLite, Socket.io, Groq SDK

## How to Run the Project

You need two separate terminal windows to run the frontend and backend simultaneously.

### 1. Start the Backend API
The backend handles the SQLite database, WebSockets for live chat, and the AI Notice extraction.
```bash
cd backend
npm run dev
```
*(The backend runs on http://localhost:5000)*

### 2. Start the Frontend React App
The frontend is the UI where users log in and chat.
```bash
cd frontend
npm run dev
```
*(The frontend runs on http://localhost:5173 or 5174)*

### 3. Open in Browser
Once both are running, open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

---

## Features
* **Real-time Chatting**: Powered by Socket.io.
* **File & Image Attachments**: Native file uploads integrated directly into the chat.
* **Smart Notice AI**: If a message contains important information (like deadlines or exams), it is automatically extracted by the AI in the background.
* **Smart Notice Board**: A dedicated UI tab to view categorized notices, filter by importance, and see an automated Upcoming Deadlines panel. 
