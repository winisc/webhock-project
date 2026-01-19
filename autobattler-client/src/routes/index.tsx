import { Routes, Route, Navigate } from "react-router-dom";
import CreateRoom from "../app/pages/createRoom";
import JoinRoom from "../app/pages/enterRoom";
import Home from "../app/pages/home";
import Room from "../app/pages/room";

export default function AppRouter() {
  return (
    <Routes>
      {/* 404 */}
      <Route path="*" element={<h1>Not Found</h1>} />
      <Route path="/" element={<Home />} />
      <Route path="create" element={<CreateRoom />} />
      <Route path="join" element={<JoinRoom />} />
      <Route path="room" element={<Navigate to="/" replace />} />
      <Route path="room/:roomId" element={<Room />} />
    </Routes>
  );
}
