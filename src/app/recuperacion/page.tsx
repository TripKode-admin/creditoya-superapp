"use client"

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResetPasswordRequestBody {
    token: string | null;
    newPassword: string;
}

interface ResetPasswordResponse {
    message?: string;
}

function ResetPassMagic() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const userType = searchParams.get("type");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect(() => {
        // Validate token on component mount
        const validateToken = async () => {
            if (!token || !userType) {
                toast.error("Enlace inválido o expirado");
                setTimeout(() => {
                    router.push("/auth");
                }, 3000);
                return;
            }

            try {
                // Cambiado a método GET y parámetros en la URL
                const response = await fetch(`/api/auth/recovery-pass?token=${token}&userType=${userType}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setIsTokenValid(true);
                } else {
                    toast.error(data.error || "Token inválido o expirado");
                    setTimeout(() => {
                        router.push("/auth");
                    }, 3000);
                }
            } catch (error) {
                toast.error("Error al validar el enlace");
                setTimeout(() => {
                    router.push("/auth");
                }, 3000);
            }
        };

        validateToken();
    }, [token, userType, router]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        setIsLoading(true);

        try {
            const requestBody: ResetPasswordRequestBody = { token, newPassword: password };
            const response = await fetch("/api/auth/recovery-pass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data: ResetPasswordResponse = await response.json();

            if (response.ok) {
                toast.success("Contraseña restablecida con éxito");
                setTimeout(() => {
                    router.push("/auth");
                }, 2000);
            } else {
                toast.error(data.message || "Error al restablecer la contraseña");
            }
        } catch (error) {
            toast.error("Error al procesar la solicitud");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTokenValid) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Verificando enlace...
                    </h1>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Restablece tu contraseña
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        {isLoading ? "Procesando..." : "Restablecer contraseña"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassMagic;