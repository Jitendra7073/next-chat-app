"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  receiver?: string;
  message: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export default function ChatMessage({
  message,
  isOwnMessage,
  showAvatar = true,
}: ChatMessageProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return messageDate.toLocaleDateString();
  };

  return (
    <div
      className={`flex gap-3 mb-4 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
      {showAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs">
            {message.sender.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col max-w-[80%] ${
          isOwnMessage ? "items-end" : ""
        }`}>
        <div className="flex items-center gap-2 mb-1">
          {!isOwnMessage && (
            <span className="text-xs font-medium text-muted-foreground">
              {message.sender}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <Card
          className={`${
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
          <CardContent className="p-3">
            <p className="text-sm">{message.message}</p>
          </CardContent>
        </Card>

        {isOwnMessage && message.status && (
          <div className="flex items-center gap-1 mt-1">
            {message.status === "sent" && (
              <Check className="h-3 w-3 text-muted-foreground" />
            )}
            {message.status === "delivered" && (
              <CheckCheck className="h-3 w-3 text-muted-foreground" />
            )}
            {message.status === "read" && (
              <CheckCheck className="h-3 w-3 text-blue-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {message.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
