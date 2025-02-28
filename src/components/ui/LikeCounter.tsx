import { useState } from "react";
import LikeIcon from "@icons/jsx-icons/like";
import UnlikeIcon from "@icons/jsx-icons/unlike";

export default function LikeCounter() {
  const [likes, setLikes] = useState<number>(0);

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  const handleUnlike = () => {
    if (likes <= 0) return;
    setLikes((prev) => prev - 1);
  };

  return (
    <div className="flex items-center justify-between gap-2 w-fit [&>button]:rounded-full">
      <button
        onClick={handleLike}
        type="button"
        className="text-black bg-white transition-all hover:bg-white/80 flex items-center gap-3 py-1.5 px-3"
      >
        <span className="leading-relaxed font-semibold">{likes}</span>
        <LikeIcon className="size-5" />
      </button>
      <button
        onClick={handleUnlike}
        type="button"
        className="bg-red-600/80 text-white transition-all hover:bg-red-600/90 p-2.5"
      >
        <UnlikeIcon className="size-5" />
      </button>
    </div>
  );
}
