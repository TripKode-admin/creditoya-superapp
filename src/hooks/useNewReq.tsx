"use client"

import { useEffect, useState, useCallback } from "react";
import usePanel from "./usePanel";
import axios from "axios";
import { useRouter } from "next/navigation";

// Tipos bien definidos
type FileField = 'labor_card' | 'fisrt_flyer' | 'second_flyer' | 'third_flyer';

interface FormDataProps {
    phone: string[]; // Cambiado de string a string[]
    entity: string;
    city: string;
    residence_address: string;
    bankNumberAccount: string;
    cantity: string;
    signature: string | null;
    terms_and_conditions: boolean;
    labor_card: File | null;
    fisrt_flyer: File | null;
    second_flyer: File | null;
    third_flyer: File | null;
}

interface LoanStorageData {
    data: any;
    expiration: number;
}

interface LoanState {
    formData: FormDataProps;
    acceptedTerms: boolean;
    isCreating: boolean;
    isCheckingStorage: boolean;
    isSuccessPreCreate: boolean;
    preLoanId: string | null;
    preToken: string | null;
    isSuccessVerifyToken: boolean;
}

const STORAGE_KEY = 'loanSuccess';
const STORAGE_EXPIRATION = 15 * 60 * 1000; // 15 minutos en milisegundos

// Valores iniciales
const initialFormData: FormDataProps = {
    phone: [], // Cambiado de "" a []
    entity: "",
    bankNumberAccount: "",
    cantity: "",
    signature: null,
    labor_card: null,
    fisrt_flyer: null,
    second_flyer: null,
    third_flyer: null,
    terms_and_conditions: false,
    city: "",
    residence_address: "",
};

const initialState: LoanState = {
    formData: initialFormData,
    acceptedTerms: false,
    isCreating: true,
    isCheckingStorage: true,
    isSuccessPreCreate: false,
    preLoanId: null,
    preToken: null,
    isSuccessVerifyToken: false
};

function useFormReq() {
    const { userComplete } = usePanel();
    const router = useRouter();
    const [state, setState] = useState<LoanState>(initialState);

    console.log("useFormReq initialized with state:", state);

    // Funciones utilitarias
    const updateState = useCallback((updates: Partial<LoanState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const updateFormData = useCallback((updates: Partial<FormDataProps>) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...updates }
        }));
    }, []);

    // Funciones para almacenamiento local
    const storeLoanData = useCallback((data: any) => {
        const storageData: LoanStorageData = {
            data,
            expiration: new Date().getTime() + STORAGE_EXPIRATION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    }, []);

    const getLoanData = useCallback(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) return null;

        try {
            const { data, expiration } = JSON.parse(storedData) as LoanStorageData;
            if (new Date().getTime() > expiration) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return data;
        } catch (error) {
            console.error("Error parsing stored loan data:", error);
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }, []);

    // Verificar localStorage al cargar
    useEffect(() => {
        const checkStoredLoanData = () => {
            try {
                const storedLoanData = getLoanData();
                if (storedLoanData) {
                    updateState({
                        preLoanId: storedLoanData.loanId,
                        isSuccessPreCreate: true,
                        isCreating: false
                    });
                } else {
                    updateState({
                        isCreating: false
                    });
                }
                updateState({
                    isCheckingStorage: false
                });
            } catch (error) {
                console.error("Error checking stored loan data:", error);
                updateState({
                    isCheckingStorage: false,
                    isCreating: false
                });
            }
        };

        checkStoredLoanData();
    }, [getLoanData, updateState]);

    // Funciones para manejar números de teléfono
    const addPhoneNumber = useCallback((phoneNumber: string) => {
        if (phoneNumber.trim() && !state.formData.phone.includes(phoneNumber.trim())) {
            updateFormData({
                phone: [...state.formData.phone, phoneNumber.trim()]
            });
        }
    }, [state.formData.phone, updateFormData]);

    const removePhoneNumber = useCallback((index: number) => {
        const newPhones = state.formData.phone.filter((_, i) => i !== index);
        updateFormData({ phone: newPhones });
    }, [state.formData.phone, updateFormData]);

    const editPhoneNumber = useCallback((index: number, newPhone: string) => {
        if (newPhone.trim()) {
            const newPhones = [...state.formData.phone];
            newPhones[index] = newPhone.trim();
            updateFormData({ phone: newPhones });
        }
    }, [state.formData.phone, updateFormData]);

    // Manejadores de eventos
    const handleFieldChange = useCallback((field: keyof FormDataProps, value: any) => {
        updateFormData({ [field]: value });
    }, [updateFormData]);

    const handleTermsChange = useCallback(() => {
        const newValue = !state.acceptedTerms;
        updateState({ acceptedTerms: newValue });
        updateFormData({ terms_and_conditions: newValue });
    }, [state.acceptedTerms, updateFormData, updateState]);

    const handleFileUpload = useCallback((field: FileField, file: File | null) => {
        updateFormData({ [field]: file });
    }, [updateFormData]);

    // Función para enviar el formulario
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!state.acceptedTerms) {
            alert("Debes aceptar los términos y condiciones para continuar.");
            return;
        }

        if (state.formData.phone.length < 2) {
            alert("Debes agregar al menos 2 números de contacto.");
            return;
        }

        try {
            updateState({ isCreating: true });

            const apiFormData = new FormData();

            // Archivos
            const fileFields: FileField[] = ['labor_card', 'fisrt_flyer', 'second_flyer', 'third_flyer'];
            fileFields.forEach(field => {
                const file = state.formData[field];
                if (file) apiFormData.append(field, file);
            });

            // Datos de texto
            if (state.formData.signature) {
                apiFormData.append('signature', state.formData.signature);
            }

            // Convertir array de teléfonos a string para el envío
            apiFormData.append('phone', JSON.stringify(state.formData.phone));
            apiFormData.append('user_id', userComplete?.id as string);
            apiFormData.append('entity', state.formData.entity);
            apiFormData.append('bankNumberAccount', state.formData.bankNumberAccount);
            apiFormData.append('cantity', state.formData.cantity);
            apiFormData.append('terms_and_conditions', state.formData.terms_and_conditions.toString());
            apiFormData.append('isValorAgregado', (userComplete?.currentCompanie === "valor_agregado").toString());
            apiFormData.append('city', state.formData.city);
            apiFormData.append('residence_address', state.formData.residence_address);

            console.log("Enviando datos del formulario:", Object.fromEntries(apiFormData.entries()));

            const response = await axios.post("/api/loan", apiFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (response.data.success) {
                storeLoanData(response.data.loanDetails);
                updateState({
                    preLoanId: response.data.loanDetails.loanId,
                    isSuccessPreCreate: true,
                    isCreating: false
                });
            } else {
                alert("Error al crear el préstamo: " + response.data.error);
                updateState({ isCreating: false });
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.");
            updateState({ isCreating: false });
        }
    }, [state.formData, state.acceptedTerms, userComplete, storeLoanData, updateState]);

    // Verificación de token
    const handleVerifyToken = useCallback(async (token: string) => {
        try {
            const response = await axios.post(
                "/api/loan/verify-token",
                {
                    preToken: token,
                    preLoanId: state.preLoanId,
                    userId: userComplete?.id
                },
                { withCredentials: true }
            );

            return response.data.success ? response.data.data : false;
        } catch (error) {
            console.error("Error al verificar el token:", error);
            alert("Ocurrió un error al verificar el token. Por favor intenta nuevamente.");
            return false;
        }
    }, [state.preLoanId, userComplete?.id]);

    const handleCodeChange = useCallback((code: string) => {
        updateState({ preToken: code });
    }, [updateState]);

    const sentToken = useCallback(async () => {
        if (!state.preToken || state.preToken.length !== 6) {
            if (state.preToken?.length !== 6) {
                console.warn("El token debe tener 6 digitos");
            }
            return;
        }

        const resToken = await handleVerifyToken(state.preToken);

        if (resToken) {
            updateState({
                isSuccessPreCreate: false,
                preLoanId: null,
                isSuccessVerifyToken: true,
                preToken: null
            });
            localStorage.removeItem(STORAGE_KEY);

            const redirectTimer = setTimeout(() => router.push("/panel"), 4000);
            return () => clearTimeout(redirectTimer);
        } else {
            updateState({ preToken: null });
        }
    }, [state.preToken, handleVerifyToken, updateState, router]);

    return {
        // Estados
        userComplete,
        isCheckingStorage: state.isCheckingStorage,
        isCreating: state.isCreating,
        IsSuccessPreCreate: state.isSuccessPreCreate,
        acceptedTerms: state.acceptedTerms,
        PreLoanId: state.preLoanId,
        formData: state.formData,
        isSuccesVerifyToken: state.isSuccessVerifyToken,

        // Manejadores de actualización
        setIsSuccessPreCreate: useCallback((value: boolean) =>
            updateState({ isSuccessPreCreate: value }), [updateState]),
        setPreLoanId: useCallback((value: string | null) =>
            updateState({ preLoanId: value }), [updateState]),
        handleBankSelect: useCallback((option: string) =>
            handleFieldChange('entity', option), [handleFieldChange]),

        // Nuevos manejadores para teléfonos
        addPhoneNumber,
        removePhoneNumber,
        editPhoneNumber,

        handleBankAccountChange: useCallback((value: string) =>
            handleFieldChange('bankNumberAccount', value), [handleFieldChange]),
        handleCantityChange: useCallback((value: string) =>
            handleFieldChange('cantity', value), [handleFieldChange]),
        handleSignature: useCallback((value: string | null) =>
            handleFieldChange('signature', value), [handleFieldChange]),
        handleFileUpload,
        handleTermsChange,
        handleCodeChange,
        setPreToken: useCallback((value: string | null) =>
            updateState({ preToken: value }), [updateState]),

        // Funciones principales
        handleSubmit,
        handleVerifyToken,
        sentToken,
        storeLoanData,
        handleFieldChange
    };
}

export default useFormReq;