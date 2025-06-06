"use client";

import { useClientAuth } from "@/context/AuthContext";
import { ILoanApplication, User, UserCompany } from "@/types/full";
import axios from "axios";
import { useEffect, useState, useTransition, useCallback, useRef } from "react";
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

    // Ref para evitar múltiples ejecuciones de updateFieldStatuses
    const isUpdatingFields = useRef<boolean>(false);

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
        if (!userData || isUpdatingFields.current) return;

        isUpdatingFields.current = true;

        try {
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
                const value = userData[key as keyof typeof userData];
                const isCompleted = !(
                    value === "No definidos" ||
                    value === "No definido" ||
                    value === null ||
                    value === undefined ||
                    value === ""
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
                    const value = document[key as keyof typeof document];
                    const isCompleted = !(
                        value === "No definidos" ||
                        value === "No definido" ||
                        value === null ||
                        value === undefined ||
                        value === "" ||
                        (Array.isArray(value) && value.length === 0)
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

            // Calcular si todos los campos están completos
            const allComplete = statuses.length > 0 && statuses.every(field => field.completed);

            console.log('Field statuses updated:', {
                statuses,
                allComplete,
                totalFields: statuses.length,
                completedFields: statuses.filter(f => f.completed).length
            });

            setAllFieldsComplete(allComplete);
        } finally {
            isUpdatingFields.current = false;
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
                const userData = await fetchUserData(userId);

                startTransition(() => {
                    setUserComplete(userData);
                    // Usar setTimeout para asegurar que el estado se actualice antes de evaluar campos
                    setTimeout(() => {
                        updateFieldStatuses(userData);
                        setDataReady(true);
                    }, 100);
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setDataReady(true); // Marcar como listo aunque haya error para evitar loading infinito
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

            // Usar setTimeout para asegurar que el estado se actualice antes de evaluar campos
            setTimeout(() => {
                updateFieldStatuses(updatedUser);
            }, 50);

            // Refrescar desde el servidor después de un delay
            setTimeout(() => {
                if (user?.id) {
                    refreshUserData();
                }
            }, 1000);
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