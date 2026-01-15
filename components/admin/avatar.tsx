"use client";

import defaultAvatar from "@/assets/defaultAvatar.jpg";

type AvatarProps = {
  avatarUrl: string | null;
  email: string | null;
  size?: number;
  className?: string; 
};

export function Avatar({ avatarUrl, email, size = 10, className = "" }: AvatarProps) {
  const dimension = `h-${size} w-${size}`;

  return (
    <img
      src={avatarUrl || defaultAvatar.src}
      alt="User Avatar"
      className={`rounded-full object-cover cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg ${className} ${dimension}`}
    />
  );
}
