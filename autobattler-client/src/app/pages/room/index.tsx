import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Page from "../../components/Page";
import { socketService } from "../../../service/socket";
import type { Member, Room } from "../../../types/room";
import { motion, AnimatePresence } from "framer-motion";

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room>();
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);

  const socketId = localStorage.getItem("socketId") || null;
  const idVis = localStorage.getItem("idVis") || null;

  // Atualização realtime dos membros
  useEffect(() => {
    socketService.on("room-updated", setRoom);
    return () => socketService.off("room-updated");
  }, []);

  // Sala fechada ou expirada
  useEffect(() => {
    const handleCloseOrExpire = () => {
      setRoomClosed(true);

      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);

      // Limpa o timer caso o componente desmonte antes
      return () => clearTimeout(timer);
    };

    socketService.on("room-closed", handleCloseOrExpire);
    socketService.on("room-expired", handleCloseOrExpire);

    return () => {
      socketService.off("room-closed");
      socketService.off("room-expired");
    };
  }, [navigate]);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const checkRoom = async () => {
      try {
        const payload = { roomId, socketId };
        const res = await socketService.getRoom(payload);
        if (res.socketIdNow !== socketId)
          localStorage.setItem("socketId", res.socketIdNow);
        if (idVis === res.room.members[0].userId) setIsOwner(true);
        setRoom(res.room);
      } catch (err) {
        console.error(err);
        if (err === "NOT_MEMBER" || err === "INVALID_GET_ROOM")
          return navigate("/join", { state: { roomId } });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkRoom();
  }, [roomId, socketId, navigate, idVis]);

  const handleLeave = async () => {
    if (!roomId) {
      localStorage.removeItem("socketId");
      localStorage.removeItem("idVis");
      return navigate("/");
    }
    try {
      const data = { roomId, socketId };
      await socketService.leaveRoom(data);
      localStorage.removeItem("socketId");
      localStorage.removeItem("idVis");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Page title="Loading...">
        <div className="flex flex-col items-center gap-4">
          <p className="text-white/60">Loading room...</p>
        </div>
      </Page>
    );
  }

  if (!room || !roomId) return null;

  return (
    <Page title={`Room ${roomId}`}>
      {/* Banner sala fechada/expirada */}
      <AnimatePresence>
        {roomClosed && (
          <>
            {/* Overlay escurecido + blur */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40"
            />

            {/* Banner */}
            <motion.div
              key="banner"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-white px-6 py-3 rounded shadow-lg z-50"
            >
              Room closed or expired
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6 justify-center items-center max-w-2xl w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white text-2xl font-semibold">{room.name}</h2>
          {isOwner && (
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <span className="text-lg text-yellow-400">♛</span>You are the
              owner
            </span>
          )}
        </div>

        {/* Room ID Card */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 w-full border border-[#383838]">
          <p className="text-white/60 text-xs mb-2">Room ID</p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-white text-lg font-mono tracking-wider">
              {roomId}
            </code>
            <button
              onClick={copyRoomId}
              className="px-4 py-1.5 bg-[#383838] hover:bg-[#4D4D4D] text-white text-sm rounded-md transition-colors cursor-pointer"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">
            Share this ID with others so they can join
          </p>
        </div>

        {/* World Info */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 w-full border border-[#383838]">
          <p className="text-white/60 text-xs mb-2">Selected World</p>
          <span className="text-white capitalize">{room.world}</span>
        </div>

        {/* Members List */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 w-full border border-[#383838]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-xs">Members</p>
            <span className="text-white/40 text-xs">
              {room.members.length} / {room.maxMembers || 2}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {room.members.map((member: Member) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between py-2 px-3 bg-[#0a0a0a] rounded-md"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-white ${!member.online ? "opacity-50" : ""}`}
                    >
                      {member.name}
                    </span>

                    {!member.online && (
                      <span className="text-[#858585] text-sm">
                        (Disconnected)
                      </span>
                    )}

                    {idVis === member.userId && (
                      <span className="text-[#858585] text-sm">(Você)</span>
                    )}
                  </div>
                  {member.isOwner && (
                    <span className="text-lg text-white">♛</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Leave / Start Game Buttons */}
        <div className="w-full flex flex-col justify-center items-center">
          {room.members.length === 2 && isOwner && (
            <button
              onClick={handleLeave}
              className="rounded-full bg-green-900/30 hover:bg-green-900/50 sm:w-100 w-full py-2 text-lg text-green-200 shadow-lg cursor-pointer transition-colors mt-2"
            >
              Start Game
            </button>
          )}
          <button
            onClick={handleLeave}
            className="rounded-full bg-red-900/30 hover:bg-red-900/50 sm:w-100 w-full py-2 text-lg text-red-200 shadow-lg cursor-pointer transition-colors mt-2"
          >
            Leave Room
          </button>
        </div>
      </div>
    </Page>
  );
}
