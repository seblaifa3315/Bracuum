"use client";

type AvatarProps = {
  avatarUrl: string | null;
  email: string | null;
  size?: number; // optional, default 8 (Tailwind h-8 w-8)
  className?: string; // optional additional classes
};

export function Avatar({ avatarUrl, email, size = 8, className = "" }: AvatarProps) {
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
