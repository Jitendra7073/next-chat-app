"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [message, setMessage] = useState();
  const [receiver, setReceiver] = useState();
  const socket = io("http://localhost:5000");

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg);
    });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    socket.emit("send_message_by_id", { receiver, message });
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
            placeholder="User Id"
            onChange={(e: any) => {
              setReceiver(e.target.value);
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
      </div>
    </div>
  );
}
