"use client"

import { useEffect, useState } from "react";
import usePanel from "./usePanel";
import axios from "axios";
import { useRouter } from "next/navigation";

interface FormDataProps {
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

function useFormReq() {
    const { userComplete } = usePanel();

    const [formData, setFormData] = useState<FormDataProps>({
        entity: "",
        bankNumberAccount: "",
        cantity: "",
        signature: null,
        labor_card: null,
        fisrt_flyer: null,
        second_flyer: null,
        third_flyer: null,
        terms_and_conditions: false,
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isCreating, setIsCreating] = useState<boolean>(true);
    const [isCheckingStorage, setIsCheckingStorage] = useState<boolean>(true);
    const [IsSuccessPreCreate, setIsSuccessPreCreate] = useState<boolean>(false);
    const [PreLoanId, setPreLoanId] = useState<string | null>(null);
    const [preToken, setPreToken] = useState<string | null>(null);
    const [isSuccesVerifyToken, setIsSuccesVerifyToken] = useState<boolean>(false);

    const router = useRouter();

    // Check localStorage on component mount
    useEffect(() => {
        const checkStoredLoanData = () => {
            const storedLoanData = getLoanData();
            console.log(storedLoanData);
            if (storedLoanData) {
                setPreLoanId(storedLoanData.loanId);
                setIsSuccessPreCreate(true);
            }
            setIsCheckingStorage(false);
            setIsCreating(false);
        };

        // Slight delay to show loading state
        const timer = setTimeout(checkStoredLoanData, 500);
        return () => clearTimeout(timer);
    }, []);

    console.log("loan Data: ", formData)

    // Handle bank selection
    const handleBankSelect = (option: string) => {
        setFormData(prev => ({ ...prev, entity: option }));
        console.log("Selected bank:", option);
    };

    // Handle bank account number input
    const handleBankAccountChange = (value: string) => {
        setFormData(prev => ({ ...prev, bankNumberAccount: value }));
    };

    // Handle cantity input
    const handleCantityChange = (value: string) => {
        setFormData(prev => ({ ...prev, cantity: value }));
    };

    // Handle signature
    const handleSignature = (signatureData: string | null) => {
        setFormData(prev => ({ ...prev, signature: signatureData }));
        console.log("Signature saved:", signatureData ? "✓" : "✗");
    };

    // Handle file uploads
    const handleFileUpload = (
        field: 'labor_card' | 'fisrt_flyer' | 'second_flyer' | 'third_flyer',
        file: File | null
    ) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    // Handle terms and conditions toggle
    const handleTermsChange = () => {
        const newValue = !acceptedTerms;
        setAcceptedTerms(newValue);
        setFormData(prev => ({ ...prev, terms_and_conditions: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            alert("Debes aceptar los términos y condiciones para continuar.");
            return;
        }

        try {
            setIsCreating(true);
            console.log("Formulario enviado:", formData);

            // Create a FormData object to handle file uploads
            const apiFormData = new FormData();

            // Append all files
            if (formData.labor_card) apiFormData.append('labor_card', formData.labor_card);
            if (formData.fisrt_flyer) apiFormData.append('fisrt_flyer', formData.fisrt_flyer);
            if (formData.second_flyer) apiFormData.append('second_flyer', formData.second_flyer);
            if (formData.third_flyer) apiFormData.append('third_flyer', formData.third_flyer);

            // Append signature as string
            if (formData.signature) apiFormData.append('signature', formData.signature);

            // Append user ID
            apiFormData.append('user_id', userComplete?.id as string);

            // Append other form data fields
            apiFormData.append('entity', formData.entity);
            apiFormData.append('bankNumberAccount', formData.bankNumberAccount);
            apiFormData.append('cantity', formData.cantity);
            apiFormData.append('terms_and_conditions', formData.terms_and_conditions.toString());
            apiFormData.append('isValorAgregado', (userComplete?.currentCompanie === "valor_agregado").toString());

            // Make the request
            const response = await axios.post("/api/loan", apiFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            if (response.data.success) {
                console.log("data loan: ", response.data.loanDetails);
                // Store loan data in localStorage with 15 minute expiration
                storeLoanData(response.data.loanDetails);
                setPreLoanId(response.data.loanDetails.loanId);
                setIsSuccessPreCreate(true);
                setIsCreating(false);
            } else {
                alert("Error al crear el préstamo: " + response.data.error);
                setIsCreating(false);
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.");
            setIsCreating(false);
        }
    };


    const handleCodeChange = (code: string) => {
        setPreToken(code);
    };

    const sentToken = async () => {
        if (!preToken) return;

        if (preToken?.length !== 6) {
            console.warn("El token debe tener 6 digitos");
            return;
        }

        const resToken = await handleVerifyToken(preToken);

        console.log("verification token response: ", resToken);

        if (resToken) {
            setIsSuccessPreCreate(false);
            setPreLoanId(null);
            localStorage.removeItem('loanSuccess');
            setIsSuccesVerifyToken(true);

            setTimeout(() => { router.push("/panel") }, 4000);
        }

        setPreToken(null);
    }

    const handleVerifyToken = async (token: string) => {
        try {
            const response = await axios.post(
                "/api/loan/verify-token",
                { preToken: token, preLoanId: PreLoanId, userId: userComplete?.id },
                { withCredentials: true }
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                alert("Error al verificar el token: " + response.data.error);
            }
        } catch (error) {
            console.error("Error al verificar el token:", error);
            alert("Ocurrió un error al verificar el token. Por favor intenta nuevamente.");
        }
    }

    // Helper function to store loan data with expiration
    const storeLoanData = (data: any) => {
        const expirationTime = new Date().getTime() + 15 * 60 * 1000; // 15 minutes in milliseconds
        const storageData = {
            data,
            expiration: expirationTime
        };
        localStorage.setItem('loanSuccess', JSON.stringify(storageData));
    };

    // Helper function to retrieve loan data if not expired
    const getLoanData = () => {
        const storedData = localStorage.getItem('loanSuccess');
        if (!storedData) return null;

        const { data, expiration } = JSON.parse(storedData);
        const currentTime = new Date().getTime();

        if (currentTime > expiration) {
            // Data has expired, remove it
            localStorage.removeItem('loanSuccess');
            return null;
        }

        return data;
    };

    return {
        userComplete,
        isCheckingStorage,
        isCreating,
        IsSuccessPreCreate,
        setIsSuccessPreCreate,
        PreLoanId,
        setPreLoanId,
        handleSubmit,
        handleBankSelect,
        handleBankAccountChange,
        formData,
        handleCantityChange,
        handleSignature,
        handleFileUpload,
        acceptedTerms,
        handleTermsChange,
        handleVerifyToken,
        storeLoanData,
        sentToken,
        handleCodeChange,
        setPreToken,
        isSuccesVerifyToken,
    }
}

export default useFormReq;