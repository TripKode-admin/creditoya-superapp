"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/context/AuthContext"; // Asegúrate de ajustar la ruta correcta
import { UserCompany } from "@/types/full";
import axios from "axios";

function useAuth() {
    const router = useRouter();
    const authContext = useClientAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [names, setNames] = useState("");
    const [firstLastName, setFirstLastName] = useState("");
    const [secondLastName, setSecondLastName] = useState("");
    // Agregamos estado para la empresa seleccionada
    const [currentCompanie, setCurrentCompanie] = useState<UserCompany | null>(null);

    const [isRecovery, setIsRecovery] = useState(false);
    const [isActiveRecovery, setIsActiveRecovery] = useState(false);

    // console.log(
    //     [ email],
    //     [ password],
    //     [ names ],
    //     [ firstLastName ],
    //     [ secondLastName ],
    //     [ currentCompanie ]
    // )

    // Usamos el estado de carga del contexto de autenticación
    const isLoading = authContext.isLoading;
    // Usamos el error del contexto de autenticación
    const error = authContext.error;

    // Manejador para cambiar la empresa seleccionada
    const handleCompanyChange = (selectedCompany: UserCompany) => {
        setCurrentCompanie(selectedCompany);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        try {
            if (isLogin) {
                const success = await authContext.login(email, password);
                if (success) window.location.href = "/panel"
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
                if (success) window.location.href = "/panel"
            }
        } catch (err) {
            console.error('Error en autenticación:', err);
        }
    };

    const generateMagicRecovery = ({ isCancel }: { isCancel?: boolean }) => {
        if (isCancel && isCancel === true) {
            setIsRecovery(false);
        } else if (isCancel === false || !isCancel) {
            setIsRecovery(true)
        }
    }

    const handleRecoveryPassword = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();

        try {
            const resMagicLink = await axios.post(
                'api/auth/recovery-pass/magic',
                { email, userType: 'client' }
            )

            if (resMagicLink.data.success == false) throw new Error(resMagicLink.data.error);

            setIsActiveRecovery(true)
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
        }
    }

    return {
        isLogin,
        email,
        setEmail,
        password,
        setPassword,
        names,
        setNames,
        firstLastName,
        setFirstLastName,
        secondLastName,
        setSecondLastName,
        currentCompanie,
        setCurrentCompanie,
        handleCompanyChange,
        isLoading,
        error,
        isRecovery,
        isActiveRecovery,
        setIsLogin,
        handleSubmit,
        generateMagicRecovery,
        handleRecoveryPassword
    };
}

export default useAuth;