"use client";

type AvatarProps = {
  avatarUrl: string | null;
  email: string | null;
  size?: number;
  className?: string; 
};

export function Avatar({ avatarUrl, email, size = 10, className = "" }: AvatarProps) {
  const dimension = `h-${size} w-${size}`;

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={`rounded-full object-cover cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg ${className} ${dimension}`}
    />
  ) : (
    <span
      className={`flex items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 ${className} ${dimension}`}
    >
      {email?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
