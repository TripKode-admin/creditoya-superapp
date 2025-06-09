"use client";

import usePanel, { FileChangeEvent } from "@/hooks/usePanel";
import { Camera, CircleUserRound, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function PerfilAvatar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { userComplete, refreshUserData } = usePanel();
    const [uploading, setUploading] = useState(false);
    const router = useRouter()

    const handleFileChange = async (e: FileChangeEvent): Promise<void> => {
        const file: File | null = e.target.files?.[0] || null;
        if (!file) return;

        try {
            setUploading(true);

            const formData = new FormData();
            const userId = userComplete?.id;
            formData.append('file', file);
            formData.append('user_id', userId as string);

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
                console.log("Request URL:", error.config?.url);
                console.log("Request method:", error.config?.method);
                console.log("Request headers:", error.config?.headers);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleCreateLoan = () => {
        router.push("/panel")
    };

    if (!userComplete) return null;

    // Calculate completion percentage
    const requiredFields = [
        userComplete?.names,
        userComplete?.firstLastName,
        userComplete?.email,
        userComplete?.birth_day,
        userComplete?.Document?.[0]?.number,
        userComplete?.Document?.[0]?.imageWithCC,
        userComplete?.Document?.[0]?.documentSides
    ];

    const completedFields = requiredFields.filter(field =>
        field && field !== "No definido" && field.toString().trim() !== ""
    ).length;

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const isComplete = completionPercentage === 100;

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-8 mt-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center py-4 px-4 sm:py-5 sm:px-5 lg:py-6 lg:px-6 bg-white dark:bg-gray-800/50 shadow-md rounded-xl border border-gray-100 dark:border-gray-700/50 lg:min-w-[280px] xl:min-w-[320px]">
                {/* Título y descripción */}
                <div className="text-center mb-3 lg:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Avatar de tu perfil
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Agrega una foto para personalizar tu perfil
                    </p>
                </div>

                {/* Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 mb-3 lg:mb-4">
                    {userComplete.avatar === "No definido" ? (
                        <div className="w-full h-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-sm hover:border-green-400 dark:hover:border-green-500 transition-colors duration-300">
                            <CircleUserRound className="text-gray-400 dark:text-gray-500" size={32} />
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            <Image
                                src={userComplete.avatar}
                                alt="avatar"
                                width={128}
                                height={128}
                                className="w-full h-full rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-md object-cover"
                                priority={true}
                            />
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-sm">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-t-transparent border-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botón de cámara */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Camera size={12} className="text-white sm:w-3.5 sm:h-3.5" />
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

                {/* Nombre del usuario */}
                <div className="text-center lg:hidden">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {userComplete.names} {userComplete.firstLastName}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {userComplete.email}
                    </p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm h-full flex flex-col justify-between">
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 lg:mb-5">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex-shrink-0">
                                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {/* Nombre del usuario en desktop */}
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate hidden lg:block mb-1">
                                        {userComplete.names} {userComplete.firstLastName}
                                    </h2>
                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate lg:text-sm lg:text-gray-600 lg:dark:text-gray-400">
                                        Progreso del Perfil
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                                    {completionPercentage}%
                                </span>
                                {isComplete && (
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 lg:mb-6">
                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>{completedFields}/{requiredFields.length} campos</span>
                                <span className="hidden sm:block">
                                    {isComplete ? "¡Completado!" : "En progreso"}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete
                                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                                        : "bg-gradient-to-r from-green-500 to-green-600"
                                        }`}
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {isComplete && (
                        <button
                            onClick={handleCreateLoan}
                            className="w-full group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 ease-out flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden text-sm sm:text-base"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />

                            <span className="truncate">
                                <span className="hidden sm:inline">Crear Solicitud de Préstamo</span>
                                <span className="sm:hidden">Crear Solicitud</span>
                            </span>

                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PerfilAvatar;