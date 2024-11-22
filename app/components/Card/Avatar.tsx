import React, { useEffect, useState } from "react";

interface AvatarProps {
  name: string;
  size?: string; // Tamaño opcional (por defecto "w-12 h-12")
  textColor?: string; // Color del texto opcional
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "w-12 h-12",
  textColor = "text-white",
}) => {
  const [bgColor, setBgColor] = useState<string>("");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const generateRandomColor = () => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    setBgColor(generateRandomColor());
  }, []);

  return (
    <div
      className={`${size} ${bgColor} ${textColor} rounded-xl flex items-center justify-center font-semibold text-lg`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
