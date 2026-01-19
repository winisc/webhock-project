import { Socket } from "socket.io";
import {
  GetRoom,
  JoinRoom,
  Member,
  NewRoom,
  Room,
  SafeRoom,
} from "./src/types";

// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // seu frontend
    methods: ["GET", "POST"],
  },
});

// Armazena salas em memória (use Redis em produção)
const rooms = new Map();

// ----------------------------
// Loop de expiração de salas
// ----------------------------
setInterval(() => {
  const now = Date.now();

  for (const [roomId, room] of rooms) {
    console.log("room: ", { roomExp: room.expiresAt - now, roomId: room.id });
    if (!room.inGame && room.expiresAt <= now) {
      console.log(`Room ${roomId} expired. Removing.`);

      io.to(roomId).emit("room-expired");

      rooms.delete(roomId);
    }
  }
}, 1000 * 60);

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // Criar sala
  socket.on(
    "create-room",
    (
      data: NewRoom,
      callback?: (payload: { room: SafeRoom; socketId: string }) => void,
    ) => {
      const roomId = generateRoomId();
      const socketId = socket.id;

      const room: Room = {
        id: roomId,
        inGame: false,
        name: `${data.userName}'s Room`,
        world: data.world,
        ownerId: socketId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 5,
        members: [
          {
            userId: generateRoomId(),
            online: true,
            socketIdOld: null,
            socketIdNow: socket.id,
            name: data.userName + " #1",
            joinedAt: Date.now(),
            isOwner: true,
          },
        ],
        maxMembers: 2,
        isLocked: false,
      };

      rooms.set(roomId, room);
      socket.join(roomId);
      emitRoomUpdate(room);
      const safeRoom = sanitizeRoom(room);
      callback?.({ room: safeRoom, socketId });
    },
  );

  // Entrar na sala
  socket.on("join-room", (data: JoinRoom, callback) => {
    console.log("socketid", socket.id);
    console.log("Entring room: ", data);
    const room = rooms.get(data.roomId);

    if (!room) return callback({ error: "ROOM_NOT_FOUND" });

    const lenMembers = room.members.length;
    if (lenMembers >= room.maxMembers)
      return callback({ error: "ROOM_MEMBERS_FULL" });

    const socketId = socket.id;

    let member = room.members.find(
      (m: Member) => m.socketIdNow === socketId || m.socketIdOld === socketId,
    );

    if (member) {
      member.socketIdNow = socket.id;
      member.online = true;
    } else {
      member = {
        userId: generateRoomId(),
        socketIdOld: null,
        socketIdNow: socketId,
        name: data.userName + ` #${lenMembers + 1}`,
        online: true,
        isOwner: false,
      };
      room.members.push(member);
    }

    socket.join(data.roomId);
    emitRoomUpdate(room);
    callback?.({ room: room, socketId: socketId });
  });

  // Verificar sala
  socket.on("get-room", (data: GetRoom, callback) => {
    console.log("Get Room: ", data);
    const room = rooms.get(data.roomId);
    if (!room) return callback({ error: "ROOM_NOT_FOUND" });

    const member = room.members.find(
      (m: Member) =>
        m.socketIdNow === data.socketId || m.socketIdOld === data.socketId,
    );

    if (!member) return callback({ error: "NOT_MEMBER" });

    if (member.socketIdNow === data.socketId && data.socketId != socket.id)
      return callback({ error: "INVALID_GET_ROOM" });

    if (data.socketId != member.socketIdNow) member.socketIdNow = socket.id;
    member.online = true;
    socket.join(data.roomId);
    emitRoomUpdate(room);
    const safeRoom = sanitizeRoom(room);
    callback({ room: safeRoom, socketIdNow: socket.id });
  });

  // Sair da sala
  socket.on("leave-room", (data: GetRoom, callback) => {
    console.log("Leave Room: ", data);

    const room = rooms.get(data.roomId);
    if (!room) return callback?.({ error: "ROOM_NOT_FOUND" });

    const member = room.members.find(
      (m: Member) => m.socketIdNow === socket.id || m.socketIdOld === socket.id,
    );

    if (!member) return callback?.({ error: "NOT_MEMBER" });

    // Remove o member
    room.members = room.members.filter((m: Member) => m !== member);

    socket.leave(data.roomId);

    // Se era o líder → remove a sala inteira
    if (member.isOwner) {
      emitRoomUpdate(room); // avisa todo mundo primeiro
      rooms.delete(data.roomId); // depois remove da memória
      io.to(data.roomId).emit("room-closed");
      return callback?.({ closed: true });
    }

    // Se não sobrou ninguém → remove a sala
    if (room.members.length === 0) {
      emitRoomUpdate(room);
      rooms.delete(data.roomId);
      io.to(data.roomId).emit("room-closed");
      return callback?.({ closed: true });
    }
    const safeRoom = sanitizeRoom(room);
    emitRoomUpdate(room);
    callback?.({ room: safeRoom });
  });

  // Disconnect;
  socket.on("disconnect", () => {
    console.log("User disconnect: ", socket.id);

    for (const room of rooms.values()) {
      const member = room.members.find(
        (m: Member) => m.socketIdNow === socket.id,
      );
      if (!member) continue;

      member.online = false;
      member.socketIdOld = socket.id;
      member.socketIdNow = null;

      console.log(
        `Member ${member.name} it went offline in the room: ${room.id}`,
      );
      emitRoomUpdate(room);
    }
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function emitRoomUpdate(room: Room) {
  const safeRoom = sanitizeRoom(room);
  io.to(room.id).emit("room-updated", safeRoom);
}

function sanitizeRoom(room: Room): SafeRoom {
  return {
    id: room.id,
    name: room.name,
    world: room.world,
    createdAt: room.createdAt,
    maxMembers: room.maxMembers,
    isLocked: room.isLocked,
    members: room.members.map((m: Member) => ({
      userId: m.userId,
      name: m.name,
      online: m.online,
      joinedAt: m.joinedAt,
      isOwner: m.isOwner,
    })),
  };
}

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
