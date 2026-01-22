import { useEffect, useState } from "react";
import Page from "../../components/Page";
import { useLocation, useNavigate } from "react-router-dom";
import { socketService } from "../../../service/socket";
import Input from "../../components/Input";
import Button from "../../components/Button";

// import { enterRoom } from "./api";

export default function JoinRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roomIdNow = location.state?.roomId || null;

    if (roomIdNow !== null) setRoomId(roomIdNow);
  }, [location]);

  async function handleEnterRoom() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!roomId.trim()) {
      setError("Room ID is required");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = {
        userName: name.trim(),
        roomId: roomId.trim(),
      };
      const { room, socketId } = await socketService.joinRoom(payload);
      console.log("Entered room:", room.id);

      // Salva o userId no localStorage para identificar o usuário
      localStorage.setItem("socketId", socketId);
      localStorage.setItem("idVis", room.members[1].userId);

      // Navega para a sala, passando informações via state
      navigate(`/room/${room.id}`);
    } catch (err) {
      console.error(err);
      let errorMessage = typeof err === "string" ? err : "Failed to enter room";
      if (errorMessage === "ROOM_MEMBERS_FULL") errorMessage = "Room full";
      if (errorMessage === "ROOM_NOT_FOUND") errorMessage = "Room not found";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Join">
      <div className="flex flex-col gap-8 w-full max-w-xs justify-center items-center">
        <p className="text-white text-lg font-bold tracking-widest uppercase mb-4">Enter room</p>

        <div className="flex flex-col gap-4 w-full">
          <Input
            placeholder="YOUR NAME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnterRoom()}
          />

          <Input
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnterRoom()}
          />
        </div>

        <div className="h-6 flex items-center justify-center">
          <p
            className={`text-white border-b border-white text-xs tracking-widest uppercase transition-opacity duration-200 ${
              error ? "opacity-100" : "opacity-0"
            }`}
          >
            {error || ""}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={handleEnterRoom}
            disabled={loading || !name.trim() || !roomId.trim()}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entering..." : "Enter room"}
          </Button>

          <Button
            onClick={() => navigate("/")}
            disabled={loading}
            className="w-full disabled:opacity-50"
          >
            Back
          </Button>
        </div>
      </div>
    </Page>
  );
}
