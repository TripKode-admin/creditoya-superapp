"use client";

import { useClientAuth } from "@/context/AuthContext";
import { ILoanApplication, User, UserCompany } from "@/types/full";
import axios from "axios";
import { useEffect, useState, useTransition, useCallback } from "react";
import useLoadingState from "./useLoading";
import { useRouter } from "next/navigation";

export type FieldStatus = {
    name: string;
    completed: boolean;
};

export interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList };
}

/**
 * Interface para el retorno del hook usePanel
 */
export interface UsePanelReturn {
    user: any;
    userComplete: User | null;
    fieldStatuses: FieldStatus[];
    missingFields: string[];
    isLoading: boolean;
    isPending: boolean;
    allFieldsComplete: boolean;
    dataReady: boolean;
    router: ReturnType<typeof useRouter>;
    latestLoan: ILoanApplication | null | string;
    loanMessage: string;
    isLoadingLoan: boolean;
    hasActiveLoans: boolean;
    refreshUserData: () => void;
    refreshLoanData: () => void;
    toggleNewReq: (isReq?: boolean) => void;
    getLatestLoan: () => Promise<void>;
    updateFieldAndRefresh: (fieldUpdates: Partial<User>) => void;
}

/**
 * Hook personalizado para gestionar el panel de usuario y solicitudes de préstamos
 * 
 * @returns {UsePanelReturn} Estado y funciones para el panel de usuario
 */
function usePanel(): UsePanelReturn {
    const { user } = useClientAuth();
    const [userComplete, setUserComplete] = useState<User | null>(null);
    const { isLoading, executeWithLoading } = useLoadingState(true);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Estados para préstamos
    const [latestLoan, setLatestLoan] = useState<ILoanApplication | null | string>(null);
    const [loanMessage, setLoanMessage] = useState<string>("");
    const [isLoadingLoan, setIsLoadingLoan] = useState<boolean>(false);
    const [loanFetched, setLoanFetched] = useState<boolean>(false);

    // Estados para seguimiento de campos
    const [fieldStatuses, setFieldStatuses] = useState<FieldStatus[]>([]);
    const [allFieldsComplete, setAllFieldsComplete] = useState<boolean>(false);
    const [dataReady, setDataReady] = useState<boolean>(false);

    /**
     * Obtiene datos completos del usuario desde la API
     * 
     * @param {string} userId - ID del usuario
     * @returns {Promise<User>} Datos del usuario
     */
    const fetchUserData = async (userId: string): Promise<User> => {
        try {
            const response = await axios.get(`/api/auth/me?user_id=${userId}`, { withCredentials: true });
            return response.data.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error fetching user data:", error.message);
                throw new Error(error.message);
            }
            throw error;
        }
    };

    /**
     * Obtiene la última solicitud de préstamo del usuario
     * 
     * @returns {Promise<void>}
     */
    const getLatestLoan = async (): Promise<void> => {
        if (!user?.id) {
            return;
        }

        setIsLoadingLoan(true);
        try {
            const response = await axios.get(`/api/loan?user_id=${user.id}&latest=true`);

            if (response.data.success) {
                setLatestLoan(response.data.data);

                if (response.data.message) {
                    setLoanMessage(response.data.message);
                } else {
                    setLoanMessage("");
                }
            } else {
                setLoanMessage("No se pudieron cargar los préstamos");
            }
        } catch (error: any) {
            console.error("Error fetching latest loan:", error.message);
            setLoanMessage("Error al cargar tus préstamos");
        } finally {
            setIsLoadingLoan(false);
            setLoanFetched(true);
        }
    };

    /**
     * Actualiza el estado de completitud de los campos del usuario
     * 
     * @param {User | null} userData - Datos del usuario
     */
    const updateFieldStatuses = useCallback((userData: User | null) => {
        if (!userData) return;

        const statuses: FieldStatus[] = [];

        // Mapeo de campos principales
        const fieldMappings: Record<string, string> = {
            "birth_day": "Fecha de nacimiento",
        };

        // Mapeo de campos de documentos
        const documentFieldMappings: Record<string, string> = {
            "documentSides": "Documento de identidad por ambos lados",
            "imageWithCC": "Selfie de verificacion de identidad",
            "number": "Número de documento"
        };

        // Verificar campos principales
        for (const [key, label] of Object.entries(fieldMappings)) {
            const isCompleted = !(
                userData[key as keyof typeof userData] === "No definidos" ||
                userData[key as keyof typeof userData] === "No definido" ||
                userData[key as keyof typeof userData] === null ||
                userData[key as keyof typeof userData] === undefined ||
                userData[key as keyof typeof userData] === ""
            );

            statuses.push({
                name: label,
                completed: isCompleted
            });
        }

        // Verificar si la empresa está asignada
        statuses.push({
            name: "Empresa",
            completed: userData.currentCompanie !== UserCompany.NO
        });

        // Verificar campos de documentos
        if (userData.Document && userData.Document.length > 0) {
            const document = userData.Document[0];
            for (const [key, label] of Object.entries(documentFieldMappings)) {
                const isCompleted = !(
                    document[key as keyof typeof document] === "No definidos" ||
                    document[key as keyof typeof document] === "No definido" ||
                    document[key as keyof typeof document] === null ||
                    document[key as keyof typeof document] === undefined ||
                    document[key as keyof typeof document] === ""
                );

                statuses.push({
                    name: label,
                    completed: isCompleted
                });
            }
        } else {
            // Si no hay documento, marcar todos los campos como incompletos
            for (const label of Object.values(documentFieldMappings)) {
                statuses.push({
                    name: label,
                    completed: false
                });
            }
        }

        setFieldStatuses(statuses);

        // Actualizar inmediatamente el estado de completitud
        const allComplete = statuses.length > 0 && statuses.every(field => field.completed);
        setAllFieldsComplete(allComplete);

        // Disparar evento personalizado cuando todos los campos estén completos
        if (allComplete && userData) {
            // Usar setTimeout para asegurar que el estado se actualice antes del evento
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('profile-completed', {
                    detail: { userComplete: userData }
                }));
            }, 100);
        }
    }, []);

    /**
     * Obtiene y procesa los datos completos del usuario
     * 
     * @param {string} userId - ID del usuario
     */
    const getFullDataClient = async (userId: string) => {
        await executeWithLoading(async () => {
            try {
                startTransition(async () => {
                    const userData = await fetchUserData(userId);
                    setUserComplete(userData);
                    updateFieldStatuses(userData);
                    setDataReady(true);
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        });
    };

    /**
     * Nueva función para actualizar campos y refrescar inmediatamente
     * 
     * @param {Partial<User>} fieldUpdates - Campos actualizados
     */
    const updateFieldAndRefresh = useCallback((fieldUpdates: Partial<User>) => {
        if (userComplete) {
            // Actualizar el estado local inmediatamente
            const updatedUser = { ...userComplete, ...fieldUpdates };
            setUserComplete(updatedUser);

            // Actualizar los estados de campos inmediatamente
            updateFieldStatuses(updatedUser);

            // Refrescar desde el servidor después de un delay más corto
            setTimeout(() => {
                if (user?.id) {
                    refreshUserData();
                }
            }, 500); // Reducido de 1000ms a 500ms
        }
    }, [userComplete, user?.id, updateFieldStatuses]);

    // Efecto para cargar los datos del usuario cuando esté disponible
    useEffect(() => {
        if (user?.id) {
            getFullDataClient(user.id);
        }
    }, [user?.id]);

    // Efecto para cargar el último préstamo cuando sea necesario
    useEffect(() => {
        const fetchLoanData = async () => {
            if (user?.id && !loanFetched) {
                await getLatestLoan();
            }
        };

        fetchLoanData();
    }, [user?.id, loanFetched]);

    // Efecto para re-evaluar cuando userComplete cambia
    useEffect(() => {
        if (userComplete) {
            updateFieldStatuses(userComplete);
        }
    }, [userComplete, updateFieldStatuses]);

    /**
     * Actualiza los datos del usuario
     */
    const refreshUserData = () => {
        if (user?.id) {
            setDataReady(false);
            getFullDataClient(user.id);
        }
    };

    /**
     * Actualiza los datos de préstamos
     */
    const refreshLoanData = () => {
        setLoanFetched(false);
    };

    /**
     * Navega entre la vista de panel y nueva solicitud
     * 
     * @param {boolean} isReq - Indicador de estado de solicitud
     */
    const toggleNewReq = (isReq?: boolean) => {
        if (isReq === true) {
            router.push('/panel');
        } else if (!isReq || isReq === false) {
            router.push('/panel/nueva-solicitud');
        }
    }

    // Calcular campos faltantes para compatibilidad
    const missingFields = fieldStatuses
        .filter(field => !field.completed)
        .map(field => field.name);

    const hasActiveLoans = !!latestLoan;

    return {
        user,
        userComplete,
        fieldStatuses,
        missingFields,
        isLoading,
        isPending,
        allFieldsComplete,
        dataReady,
        router,
        latestLoan,
        loanMessage,
        isLoadingLoan,
        hasActiveLoans,
        refreshUserData,
        refreshLoanData,
        toggleNewReq,
        getLatestLoan,
        updateFieldAndRefresh,
    };
}

export default usePanel;