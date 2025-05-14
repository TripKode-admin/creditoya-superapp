"use client"

import { useEffect, useState, useCallback } from "react";
import usePanel from "./usePanel";
import axios from "axios";
import { useRouter } from "next/navigation";

// Tipos bien definidos
type FileField = 'labor_card' | 'fisrt_flyer' | 'second_flyer' | 'third_flyer';

interface FormDataProps {
    phone: string;
    entity: string;
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
    phone: "",
    entity: "",
    bankNumberAccount: "",
    cantity: "",
    signature: null,
    labor_card: null,
    fisrt_flyer: null,
    second_flyer: null,
    third_flyer: null,
    terms_and_conditions: false,
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

        const { data, expiration } = JSON.parse(storedData) as LoanStorageData;
        if (new Date().getTime() > expiration) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return data;
    }, []);

    // Verificar localStorage al cargar
    useEffect(() => {
        const checkStoredLoanData = () => {
            const storedLoanData = getLoanData();
            if (storedLoanData) {
                updateState({
                    preLoanId: storedLoanData.loanId,
                    isSuccessPreCreate: true
                });
            }
            updateState({
                isCheckingStorage: false,
                isCreating: false
            });
        };

        const timer = setTimeout(checkStoredLoanData, 500);
        return () => clearTimeout(timer);
    }, [getLoanData, updateState]);

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

            apiFormData.append('phone', state.formData.phone);
            apiFormData.append('user_id', userComplete?.id as string);
            apiFormData.append('entity', state.formData.entity);
            apiFormData.append('bankNumberAccount', state.formData.bankNumberAccount);
            apiFormData.append('cantity', state.formData.cantity);
            apiFormData.append('terms_and_conditions', state.formData.terms_and_conditions.toString());
            apiFormData.append('isValorAgregado', (userComplete?.currentCompanie === "valor_agregado").toString());

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
            setTimeout(() => router.push("/panel"), 4000);
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
        setIsSuccessPreCreate: (value: boolean) => updateState({ isSuccessPreCreate: value }),
        setPreLoanId: (value: string | null) => updateState({ preLoanId: value }),
        handleBankSelect: (option: string) => handleFieldChange('entity', option),
        handleNumberPhone: (value: string) => handleFieldChange('phone', value),
        handleBankAccountChange: (value: string) => handleFieldChange('bankNumberAccount', value),
        handleCantityChange: (value: string) => handleFieldChange('cantity', value),
        handleSignature: (value: string | null) => handleFieldChange('signature', value),
        handleFileUpload,
        handleTermsChange,
        handleCodeChange: (code: string) => updateState({ preToken: code }),
        setPreToken: (value: string | null) => updateState({ preToken: value }),

        // Funciones principales
        handleSubmit,
        handleVerifyToken,
        sentToken,
        storeLoanData
    };
}

export default useFormReq;