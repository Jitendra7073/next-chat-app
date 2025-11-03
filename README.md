# Real-Time Chat Application

A modern, responsive chat application built with Next.js, Socket.IO, and Tailwind CSS. Features real-time messaging, user presence, typing indicators, and local storage for chat history.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Management**: Automatic username generation and user presence tracking
- **Active User List**: See who's online and available to chat
- **Chat History**: Messages are stored in localStorage for persistence
- **Typing Indicators**: See when other users are typing
- **Notifications**: Toast notifications for new messages with sound alerts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with dark/light theme support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd web-socket-practice
```

2. Install dependencies for the client:

```bash
cd chat-app
npm install
```

3. Install dependencies for the server:

```bash
cd ../server
npm install
```

## Running the Application

1. Start the server (from the `server` directory):

```bash
npm run dev
```

The server will run on `http://localhost:5000`

2. Start the client (from the `chat-app` directory):

```bash
npm run dev
```

The client will run on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Getting Started**: When you first visit the application, a username will be automatically generated for you and stored in localStorage.

2. **Starting a Chat**:

   - View the list of active users on the left side
   - Click on any user to start a conversation
   - Type your message in the input field and press Enter or click the Send button

3. **Mobile Navigation**:

   - On mobile devices, tap the menu icon to switch between the user list and chat view
   - Use the back arrow to return to the user list from a chat

4. **Features**:
   - **Online Status**: Green dot indicates online users, gray for offline
   - **Typing Indicators**: See when someone is typing a message
   - **Message Timestamps**: Messages show relative time (e.g., "2 minutes ago")
   - **Notifications**: Receive toast notifications for new messages when chatting with other users
   - **Theme Toggle**: Switch between light and dark themes using the toggle in the top-right corner

## Project Structure

```
web-socket-practice/
├── chat-app/                 # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/            # React components
│   │   ├── chat/            # Chat-specific components
│   │   └── ui/              # Reusable UI components
│   └── lib/                 # Utility functions
└── server/                   # Express.js backend
    ├── index.js              # Server entry point
    └── package.json          # Server dependencies
```

## Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Socket.IO
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React

## Development

### Adding New Features

1. **Server-side**: Add new Socket.IO event handlers in `server/index.js`
2. **Client-side**: Create new components in `chat-app/components/`
3. **Styling**: Use Tailwind CSS classes for consistent design

### Customization

- **Theme**: Modify colors in `tailwind.config.js`
- **UI Components**: Extend components in `chat-app/components/ui/`
- **Socket Events**: Add new events in both server and client code

## Troubleshooting

1. **Connection Issues**: Ensure both server and client are running on their respective ports
2. **Messages Not Sending**: Check browser console for Socket.IO connection errors
3. **UI Issues**: Clear browser cache and localStorage if needed

## Future Enhancements

- [ ] User authentication and profiles
- [ ] File and image sharing
- [ ] Group chat functionality
- [ ] Message reactions and replies
- [ ] Voice and video calling
- [ ] End-to-end encryption
- [ ] Cloud storage for chat history

## License

This project is open source and available under the [MIT License](LICENSE).
