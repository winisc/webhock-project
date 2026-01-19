import { useEffect, useState } from "react";
import Page from "../../components/Page";
import { useLocation, useNavigate } from "react-router-dom";
import { socketService } from "../../../service/socket";

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
      <div className="flex flex-col gap-4 justify-center items-center">
        <p className="text-white text-lg">Enter room</p>

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnterRoom()}
          className="rounded-full bg-[#383838] sm:w-100 w-80 py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] pl-4 focus:outline-none focus:ring-2 focus:ring-white"
        />

        <input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnterRoom()}
          className="rounded-full bg-[#383838] sm:w-100 w-80 py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] pl-4 focus:outline-none focus:ring-2 focus:ring-white"
        />

        <div className="h-6 flex items-center justify-center">
          <p
            className={`text-red-400 text-sm transition-opacity duration-200 ${
              error ? "opacity-100" : "opacity-0"
            }`}
          >
            {error || ""}
          </p>
        </div>

        <button
          onClick={handleEnterRoom}
          disabled={loading || !name.trim() || !roomId.trim()}
          className="rounded-full sm:w-100 w-80 bg-[#383838] py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Entering..." : "Enter room"}
        </button>

        <button
          onClick={() => navigate("/")}
          disabled={loading}
          className="rounded-full sm:w-100 w-80 bg-[#383838] py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </Page>
  );
}
