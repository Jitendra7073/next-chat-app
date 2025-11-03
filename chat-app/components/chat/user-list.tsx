"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Users, Circle } from "lucide-react";

interface User {
  id: string;
  username: string;
  status: "online" | "offline";
  lastSeen: Date;
}

interface UserListProps {
  onSelectUser: (user: User) => void;
  selectedUserId?: string;
  currentUserId?: string;
  users: User[];
}

export default function UserList({
  onSelectUser,
  selectedUserId,
  currentUserId,
  users,
}: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === "online" ? "bg-green-500" : "bg-gray-400";
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Active Users
          <Badge variant="secondary" className="ml-auto">
            {filteredUsers.length}
          </Badge>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <div className="space-y-1 p-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                  selectedUserId === user.id ? "bg-accent" : ""
                }`}>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Circle
                    className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current text-white ${getStatusColor(
                      user.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.status === "online"
                      ? "Active now"
                      : formatLastSeen(user.lastSeen)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
