"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/context/AuthContext";
import { UserCompany } from "@/types/full";
import axios from "axios";

interface CompanyOption {
    id: string;
    name: string;
    logo: string;
    value: UserCompany;
}

function useAuth() {
    const authContext = useClientAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [names, setNames] = useState("");
    const [firstLastName, setFirstLastName] = useState("");
    const [secondLastName, setSecondLastName] = useState("");
    const [currentCompanie, setCurrentCompanie] = useState<UserCompany | null>(null);

    const [isRecovery, setIsRecovery] = useState(false);
    const [isActiveRecovery, setIsActiveRecovery] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [showPassword, setShowPassword] = useState(false);

    const isLoading = authContext.isLoading;
    const error = authContext.error;

    // Función de validación memoizada
    const validateField = useCallback((name: string, value: string): string => {
        switch (name) {
            case 'email':
                if (!value) return 'El correo es requerido';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Ingresa un correo válido';
                break;
            case 'password':
                if (!value) return 'La contraseña es requerida';
                if (value.length < 6) return 'Mínimo 6 caracteres';
                break;
            case 'names':
                if (!isLogin && !value.trim()) return 'Los nombres son requeridos';
                break;
            case 'firstLastName':
                if (!isLogin && !value.trim()) return 'El primer apellido es requerido';
                break;
        }
        return '';
    }, [isLogin]);

    // Manejadores de cambio optimizados y estables
    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        const error = validateField('email', value);
        setValidationErrors(prev => ({ ...prev, email: error }));
    }, [validateField]);

    const handlePasswordChange = useCallback((value: string) => {
        setPassword(value);
        const error = validateField('password', value);
        setValidationErrors(prev => ({ ...prev, password: error }));
    }, [validateField]);

    const handleNamesChange = useCallback((value: string) => {
        setNames(value);
        const error = validateField('names', value);
        setValidationErrors(prev => ({ ...prev, names: error }));
    }, [validateField]);

    const handleFirstLastNameChange = useCallback((value: string) => {
        setFirstLastName(value);
        const error = validateField('firstLastName', value);
        setValidationErrors(prev => ({ ...prev, firstLastName: error }));
    }, [validateField]);

    const handleSecondLastNameChange = useCallback((value: string) => {
        setSecondLastName(value);
    }, []);

    const handleCompanyChange = useCallback((selectedCompany: UserCompany) => {
        setCurrentCompanie(selectedCompany);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        try {
            if (isLogin) {
                const success = await authContext.login(email, password);
                if (success) window.location.href = "/panel";
            } else {
                const userData = {
                    email,
                    password,
                    names,
                    firstLastName,
                    secondLastName,
                    currentCompanie
                };
                const success = await authContext.register(userData);
                if (success) window.location.href = "/panel";
            }
        } catch (err) {
            console.error('Error en autenticación:', err);
        }
    }, [isLogin, email, password, names, firstLastName, secondLastName, currentCompanie, authContext]);

    const generateMagicRecovery = useCallback(({ isCancel }: { isCancel?: boolean }) => {
        if (isCancel && isCancel === true) {
            setIsRecovery(false);
        } else if (isCancel === false || !isCancel) {
            setIsRecovery(true);
        }
    }, []);

    const handleRecoveryPassword = useCallback(async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();

        try {
            const resMagicLink = await axios.post(
                '/api/auth/recovery-pass/magic/',
                { email, userType: 'client' }
            );

            if (resMagicLink.data.success == false) throw new Error(resMagicLink.data.error);

            setIsActiveRecovery(true);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
        }
    }, [email]);

    // Memoizamos el array de companies para evitar recreaciones innecesarias
    const companies: CompanyOption[] = useMemo(() => [
        {
            id: '1',
            name: 'INCAUCA SAS',
            logo: '/logos/incauca-sas.png',
            value: UserCompany.INCAUCA_SAS
        },
        {
            id: '2',
            name: 'INCAUCA COSECHA',
            logo: '/logos/incauca-cosecha.png',
            value: UserCompany.INCAUCA_COSECHA
        },
        {
            id: '3',
            name: 'PROVIDENCIA SAS',
            logo: '/logos/providencia-sas.png',
            value: UserCompany.PROVIDENCIA_SAS
        },
        {
            id: '4',
            name: 'PROVIDENCIA COSECHA',
            logo: '/logos/providencia-cosecha.png',
            value: UserCompany.PROVIDENCIA_COSECHA
        },
        {
            id: '5',
            name: 'CONALTA',
            logo: '/logos/conalta.png',
            value: UserCompany.CONALTA
        },
        {
            id: '6',
            name: 'PICHICHI SAS',
            logo: '/logos/pichichi-sas.png',
            value: UserCompany.PICHICHI_SAS
        },
        {
            id: '7',
            name: 'PICHICHI CORTE',
            logo: '/logos/pichichi-corte.png',
            value: UserCompany.PICHICHI_COORTE
        },
        {
            id: '8',
            name: 'VALOR AGREGADO',
            logo: '/logos/valor-agregado.png',
            value: UserCompany.VALOR_AGREGADO
        }
    ], []);

    return {
        // States
        isLogin,
        email,
        password,
        names,
        firstLastName,
        secondLastName,
        currentCompanie,
        isLoading,
        error,
        isRecovery,
        isActiveRecovery,
        validationErrors,

        // Setters optimizados
        setIsLogin,
        handleEmailChange,
        handlePasswordChange,
        handleNamesChange,
        handleFirstLastNameChange,
        handleSecondLastNameChange,
        handleCompanyChange,

        // Actions
        handleSubmit,
        generateMagicRecovery,
        handleRecoveryPassword,
        showPassword,
        setShowPassword,
        companies
    };
}

export default useAuth;