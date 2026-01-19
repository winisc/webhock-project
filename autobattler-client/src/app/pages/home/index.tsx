import { useNavigate } from "react-router-dom";
import Page from "../../components/Page";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Page title="Home">
      <div className="flex flex-col gap-4 sm:w-100 w-80 justify-center items-center">
        <button
          onClick={() => navigate("/create")}
          className="rounded-full bg-[#383838] sm:w-100 w-80  py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer"
        >
          New room
        </button>

        <button
          onClick={() => navigate("/join")}
          className="rounded-full bg-[#383838] sm:w-100 w-80  py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer"
        >
          Enter existing room
        </button>
      </div>
    </Page>
  );
}
