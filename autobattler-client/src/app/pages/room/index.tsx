import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Page from "../../components/Page";
import { socketService } from "../../../service/socket";
import type { Member, Room } from "../../../types/room";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button";

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
          <p className="text-white/60 tracking-widest uppercase text-sm animate-pulse">Loading room...</p>
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
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Banner */}
            <motion.div
              key="banner"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 border border-white bg-black text-white px-8 py-4 z-50 uppercase tracking-widest"
            >
              Room closed or expired
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8 justify-center items-center max-w-2xl w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white text-3xl font-bold uppercase tracking-widest">{room.name}</h2>
          {isOwner && (
            <span className="text-white/60 text-xs tracking-[0.2em] border border-white/20 px-2 py-0.5 rounded-full">
              OWNER
            </span>
          )}
        </div>

        {/* Room ID Card */}
        <div className="w-full flex flex-col gap-2">
           <div className="flex items-center justify-between border-b border-white pb-2">
             <span className="text-white/40 text-xs uppercase tracking-widest">Room ID</span>
             <code className="text-white text-sm font-mono tracking-wider">{roomId}</code>
           </div>
           
           <div className="flex justify-end">
             <button 
                onClick={copyRoomId}
                className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer"
             >
                {copied ? "COPIED" : "COPY ID"}
             </button>
           </div>
        </div>

        {/* World Info */}
        <div className="w-full flex items-center justify-between border-b border-white pb-2">
          <span className="text-white/40 text-xs uppercase tracking-widest">World</span>
          <span className="text-white uppercase tracking-wider">{room.world}</span>
        </div>

        {/* Members List */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white pb-2">
            <span className="text-white/40 text-xs uppercase tracking-widest">Members</span>
            <span className="text-white text-xs tracking-wider">
              {room.members.length} / {room.maxMembers || 2}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {room.members.map((member: Member) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between py-3 px-4 border border-white/20 bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-white uppercase tracking-wider font-light ${!member.online ? "opacity-40" : ""}`}
                    >
                      {member.name}
                    </span>

                    {!member.online && (
                      <span className="text-white/40 text-xs uppercase tracking-widest">
                        (OFFLINE)
                      </span>
                    )}

                    {idVis === member.userId && (
                      <span className="text-white/40 text-xs uppercase tracking-widest border border-white/20 px-1.5 py-0.5 scale-75 origin-left">YOU</span>
                    )}
                  </div>
                  {member.isOwner && (
                    <span className="text-xs text-white/60 border border-white/20 px-1.5 py-0.5 uppercase tracking-wider">OWNER</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Leave / Start Game Buttons */}
        <div className="w-full flex flex-col gap-4 mt-4">
          {room.members.length === 2 && isOwner && (
            <Button
              onClick={handleLeave} // NOTE: logic for start game was just placeholder in original code too? Wait, original had onClick={handleLeave} for start game? Let me check.
              // Original code:
              // <button onClick={handleLeave} ... >Start Game</button>
              // This seems wrong in original code, but "maintain my logic" means I should keep it as is?
              // Or was it `handleStart`? Let's check the original file content I read.
              // Step 42 output:
              // <button onClick={handleLeave} ... > Start Game </button>
              // Yes, original code had handleLeave for Start Game. That's weird.
              // But user said "mantenha minha logica... intacta".
              // Maybe it really is just a leave button disguised? Or a mistake?
              // If I change it, I break "logic intact" rule if it was intentional placeholder.
              // But it is clearly a bug if it says "Start Game" and leaves. 
              // However, I am here for DESIGN refactor. I should replicate the behavior exactly as found, or maybe just `onClick={() => {}}` if I suspect it's placeholder. 
              // But strictly following instructions: "keep logic intact".
              // I will keep `onClick={handleLeave}` but maybe add a TODO comment or just leave it. 
              // Actually, looking at clean code principles, reproducing a bug is bad, but maybe the user wants to test layout.
              // PROBABLY it was `handleStart` but I missed it? No, I see `const handleLeave` defined but no `handleStart`.
              // Okay, I will keep it as is.
              className="w-full"
              variant="success"
            >
              Start Game
            </Button>
          )}
          <Button
            onClick={handleLeave}
            className="w-full"
            variant="danger"
          >
            Leave Room
          </Button>
        </div>
      </div>
    </Page>
  );
}
