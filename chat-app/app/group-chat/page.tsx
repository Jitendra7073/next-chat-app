"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [message, setMessage] = useState();
  const [roomName, setRoomName] = useState();
  const socket = io("http://localhost:5000");

  useEffect(() => {
    socket.on("receice_room_message", (message) => {
      console.log(message);
    });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    socket.emit("create_and_chat_in_room", { roomName, message });
  };
  return (
    <div className="flex justify-center items-center">
      <div className="container flex flex-col justify-center items-center">
        <div className="py-10 text-center">
          <h1 className="text-2xl font-semibold uppercase">Web Chat App</h1>
          <span className="text-sm text-gray-500">made with socket.io</span>
        </div>
        <form onSubmit={handleSubmit} className="w-100 flex flex-col gap-2">
          <Input
            type="text"
            placeholder="Create or Join Room by Name"
            onChange={(e: any) => {
              setRoomName(e.target.value);
            }}
          />
          <Input
            type="text"
            placeholder="Message"
            onChange={(e: any) => {
              setMessage(e.target.value);
            }}
            required
          />
          <Button variant="outline">Send</Button>
        </form>
        {roomName && (
          <span className="text-sm text-gray-500">Room Name : {roomName}</span>
        )}
      </div>
    </div>
  );
}
