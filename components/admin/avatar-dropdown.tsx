"use client";

import {useState, useRef, useEffect} from "react";
import {LogoutButton} from "@/components/auth/logout-button";
import {Avatar} from "./avatar"; // import the new Avatar component

type AvatarDropdownProps = {
    email: string | null;
    avatarUrl: string | null;
    fullName: string | null;
};

export function AvatarDropdown({email, avatarUrl, fullName}: AvatarDropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setOpen(!open)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full">
                <Avatar avatarUrl={avatarUrl} email={email} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                        <div className="flex">
                            <Avatar avatarUrl={avatarUrl} email={email} />
                            <div>
                                {fullName && <p className="text-sm font-medium">{fullName}</p>}
                                {email && <p className="text-xs text-gray-500">{email}</p>}
                            </div>
                        </div>
                    </div>
                    <ul className="flex flex-col py-1">
                        <li>
                            <a href="/admin/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                                Manage profile
                            </a>
                        </li>
                        <li>
                            <div className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-red-600">
                                <LogoutButton />
                            </div>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
