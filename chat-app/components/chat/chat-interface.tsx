"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UserList from "@/components/chat/user-list";
import ChatMessage from "@/components/chat/chat-message";
import UsernameInput from "@/components/chat/username-input";
import { useToast } from "@/components/ui/use-toast";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Bell,
  Menu,
  ArrowLeft,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  status: "online" | "offline";
  lastSeen: Date;
}

interface Message {
  id: string;
  sender: string;
  receiver?: string;
  message: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

export default function ChatInterface() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState<User | null>(null);
  const [showUserList, setShowUserList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [usernameEntered, setUsernameEntered] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Refs to store latest state values for use in socket event handlers
  const selectedUserRef = useRef<User | null>(null);
  const usersRef = useRef<User[]>([]);
  const isMobileRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Request notification permission and handle visibility changes
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Handle visibility change for background notifications
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Clear any pending notifications when tab becomes visible
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.getNotifications().then((notifications) => {
              notifications.forEach((notification) => notification.close());
            });
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Check if mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    // Try to use the MP3 file first, fallback to generated sound
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => {
        // If MP3 fails, try to use the generated sound
        try {
          // Create a simple beep sound using Web Audio API
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            600,
            audioContext.currentTime + 0.1
          );

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (err) {
          console.error("Failed to play notification sound:", err);
        }
      });
    } catch (e) {
      console.error("Failed to play notification sound:", e);
    }
  };

  // Function to show browser notification
  const showBrowserNotification = (
    title: string,
    body: string,
    icon?: string
  ) => {
    if ("Notification" in window && Notification.permission === "granted") {
      // Only show notification if the document is not visible
      if (document.visibilityState !== "visible") {
        const notification = new Notification(title, {
          body,
          icon: icon || "/favicon.ico",
          tag: "chat-notification",
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!usernameEntered) return;

    const newSocket = io("https://next-chat-app-server-89xe.onrender.com");
    setSocket(newSocket);

    // Register current user
    const username = localStorage.getItem("chat_username") || "";

    if (username) {
      newSocket.emit("register_user", { username });

      newSocket.on("user_registered", (user: User) => {
        setCurrentUser(user);
      });

      // Listen for user list updates
      newSocket.on("update_user_list", (usersList: User[]) => {
        setUsers(usersList);
      });

      // Listen for new messages
      newSocket.on("receive_message_by_id", (messageData: Message) => {
        setMessages((prev) => [...prev, messageData]);

        // Show notification if message is from a user that's not currently selected
        const currentSelectedUser = selectedUserRef.current;
        if (currentSelectedUser?.id !== messageData.sender) {
          playNotificationSound();

          // Find the sender in the users list
          const currentUsers = usersRef.current;
          const senderUser = currentUsers.find(
            (user) => user.username === messageData.sender
          );

          // Show in-app toast notification
          toast({
            title: `New message from ${messageData.sender}`,
            description: messageData.message,
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (senderUser) {
                    handleSelectUser(senderUser);
                    if (isMobileRef.current) {
                      setShowUserList(false);
                    }
                  }
                }}>
                View
              </Button>
            ),
          });

          // Show browser notification if app is in background
          showBrowserNotification(
            `New message from ${messageData.sender}`,
            messageData.message
          );
        }
      });

      // Listen for typing indicators
      newSocket.on("user_typing", ({ userId, isTyping }) => {
        const currentSelectedUser = selectedUserRef.current;
        if (currentSelectedUser && userId === currentSelectedUser.id) {
          setUserTyping(isTyping ? currentSelectedUser : null);
        }
      });

      // Listen for new user connections
      newSocket.on("user_connected", (user: User) => {
        // Show notification for new user
        toast({
          title: `${user.username} is now online`,
          description: "You can start chatting with them",
        });

        // Show browser notification if app is in background
        showBrowserNotification(
          `${user.username} is now online`,
          "You can start chatting with them"
        );
      });
    }

    return () => {
      newSocket.disconnect();
    };
  }, [usernameEntered]); // Only depend on usernameEntered to prevent reconnection on every render

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUsernameSubmit = (username: string) => {
    setUsernameEntered(true);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUserTyping(null);
    if (isMobile) {
      setShowUserList(false);
    }
  };

  const handleBackToUserList = () => {
    setShowUserList(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !socket) return;

    const messageData: Message = {
      id: Date.now().toString(),
      sender: currentUser?.username || "Unknown",
      receiver: selectedUser.id,
      message,
      timestamp: new Date(),
      status: "sent",
    };

    // Add message to local state
    setMessages((prev) => [...prev, messageData]);

    // Send message via socket
    socket.emit("send_message_by_id", {
      receiver: selectedUser.id,
      message,
      sender: currentUser?.username,
    });

    // Clear typing indicator when message is sent
    socket.emit("typing", {
      receiver: selectedUser.id,
      isTyping: false,
    });

    setMessage("");
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit("typing", {
        receiver: selectedUser.id,
        isTyping: message.length > 0,
      });
    }
  };

  // Clear typing indicator when message input is cleared
  useEffect(() => {
    if (socket && selectedUser && message.length === 0) {
      socket.emit("typing", {
        receiver: selectedUser.id,
        isTyping: false,
      });
    }
  }, [message, socket, selectedUser]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show username input if not entered yet
  if (!usernameEntered) {
    return <UsernameInput onUsernameSubmit={handleUsernameSubmit} />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* User List - Always visible on desktop, conditionally on mobile */}
      <div
        className={`${
          isMobile ? (showUserList ? "w-full" : "hidden") : "w-1/3"
        } border-r md:block`}>
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>
          {isMobile && selectedUser && (
            <Button variant="ghost" size="icon" onClick={handleBackToUserList}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
        <UserList
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.id}
          currentUserId={currentUser?.id}
          users={users}
        />
      </div>

      {/* Chat Area - Hidden on mobile when user list is shown */}
      <div
        className={`${
          isMobile ? (showUserList ? "hidden" : "w-full") : "flex-1"
        } flex flex-col`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Card className="border-b rounded-none">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToUserList}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {selectedUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {selectedUser.username}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedUser.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {selectedUser.status === "online"
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages
                .filter(
                  (msg) =>
                    (msg.sender === currentUser?.username &&
                      msg.receiver === selectedUser.id) ||
                    (msg.sender === selectedUser.username &&
                      msg.receiver === currentUser?.id)
                )
                .map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.sender === currentUser?.username}
                  />
                ))}

              {userTyping && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}></div>
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}></div>
                  </div>
                  <span>{userTyping.username} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <Card className="border-t rounded-none">
              <CardContent className="p-3">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Select a user to start chatting
              </h3>
              <p className="text-muted-foreground">
                Choose from the list of active users
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
