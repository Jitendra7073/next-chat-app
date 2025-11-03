"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MessageCircle } from "lucide-react";

interface UsernameInputProps {
  onUsernameSubmit: (username: string) => void;
}

export default function UsernameInput({
  onUsernameSubmit,
}: UsernameInputProps) {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSubmitting(true);
      localStorage.setItem("chat_username", username.trim());
      onUsernameSubmit(username.trim());
    }
  };

  // Check if username already exists in localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("chat_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Chat App</CardTitle>
          <p className="text-muted-foreground">
            Enter your username to start chatting
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!username.trim() || isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Chat"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Active users will appear once you join
            </p>
            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs">
                Real-time Messaging
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
