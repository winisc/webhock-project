// services/socket.ts
import { io, Socket } from "socket.io-client";
import type { Room, NewRoom, JoinRoom, GetRoom } from "../types/room";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io("http://localhost:3001");

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Criar sala
  createRoom(data: NewRoom): Promise<{ room: Room; socketId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject("Socket not connected");

      this.socket.emit("create-room", data, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Criar sala
  getRoom(data: GetRoom): Promise<{ room: Room; socketIdNow: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject("Socket not connected");

      this.socket.emit("get-room", data, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Entrar na sala
  joinRoom(data: JoinRoom): Promise<{ room: Room; socketId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject("Socket not connected");

      this.socket.emit("join-room", data, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Sair da sala
  leaveRoom(data: GetRoom) {
    if (!this.socket) return;
    this.socket.emit("leave-room", data);
  }

  on(event: string, cb: (...args: any[]) => void) {
    this.socket?.on(event, cb);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
