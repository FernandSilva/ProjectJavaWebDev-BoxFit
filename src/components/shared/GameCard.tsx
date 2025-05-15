import React from "react";

type GameCardProps = {
  title: string;
  iframeUrl: string;
};

const GameCard = ({ title, iframeUrl }: GameCardProps) => {
  return (
    <div className="w-full md:w-[300px] h-[240px] border rounded-lg overflow-hidden shadow-md bg-white">
      <div className="w-full h-[30px] bg-gray-100 text-center flex items-center justify-center font-medium text-sm">
        {title}
      </div>
      <iframe
        src={iframeUrl}
        title={title}
        className="w-full h-[210px] border-none"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default GameCard;
