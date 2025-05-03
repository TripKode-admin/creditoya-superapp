"use client";

import usePanel, { FileChangeEvent } from "@/hooks/usePanel";
import { Camera, CircleUserRound } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import axios from "axios";

function PerfilAvatar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { userComplete, refreshUserData } = usePanel();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: FileChangeEvent): Promise<void> => {
        const file: File | null = e.target.files?.[0] || null;
        if (!file) return;

        try {
            setUploading(true);

            // Create form data to send to API
            const formData = new FormData();
            const userId = userComplete?.id;
            formData.append('file', file);
            formData.append('user_id', userId as string);

            // Try using the API route that we know works - the one you shared
            const response = await axios.put('/api/auth/me/avatar', formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                if (refreshUserData) {
                    refreshUserData();
                } else {
                    console.log("Avatar updated successfully");
                }
            } else {
                console.error("Error uploading avatar:", response.data.error);
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response data:", error.response?.data);
                console.error("Response status:", error.response?.status);

                // Log the request details to check where it's going
                console.log("Request URL:", error.config?.url);
                console.log("Request method:", error.config?.method);
                console.log("Request headers:", error.config?.headers);
            }
        } finally {
            setUploading(false);
        }
    };

    if (!userComplete) return null;

    return (
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40">
            {userComplete.avatar === "No definido" ? (
                <div className="w-full h-full flex justify-center items-center bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 shadow-md">
                    <CircleUserRound className="text-gray-400 dark:text-zinc-500" size={60} />
                </div>
            ) : (
                <div className="relative w-full h-full">
                    <Image
                        src={userComplete.avatar}
                        alt="avatar"
                        width={160}
                        height={160}
                        className="w-full h-full rounded-full border border-gray-200 dark:border-zinc-700 shadow-md object-cover"
                    />
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Botón de cámara */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
                <Camera size={18} className="text-gray-600 dark:text-zinc-300" />
            </button>

            {/* Input oculto */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />
        </div>
    );
}

export default PerfilAvatar;