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

    // console.log("useFormReq initialized with state:", state);

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

    // Funciones de validación del lado del cliente
    const validateFile = useCallback((file: File, fieldName: string): { isValid: boolean; error?: string } => {
        console.log(`🔍 [VALIDATION] Validando archivo ${fieldName}:`, {
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            type: file.type
        });

        // Validar tipo de archivo
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            const error = `El archivo ${fieldName} debe ser PDF, JPG o PNG. Tipo actual: ${file.type}`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        // Validar tamaño de archivo (12MB máximo)
        const maxFileSize = 12 * 1024 * 1024; // 12MB
        if (file.size > maxFileSize) {
            const error = `El archivo ${fieldName} es demasiado grande. Máximo 12MB. Actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        console.log(`✅ [VALIDATION] Archivo ${fieldName} válido`);
        return { isValid: true };
    }, []);

    const validatePhoneNumber = useCallback((phone: string): { isValid: boolean; error?: string } => {
        console.log(`🔍 [VALIDATION] Validando teléfono: ${phone}`);
        
        // Remover espacios y caracteres especiales
        const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
        
        // Validar que tenga entre 7 y 15 dígitos
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            const error = `El teléfono debe tener entre 7 y 15 dígitos. Actual: ${cleanPhone.length}`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        // Validar que no sea solo ceros
        if (/^0+$/.test(cleanPhone)) {
            const error = "El teléfono no puede ser solo ceros";
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        console.log(`✅ [VALIDATION] Teléfono válido: ${cleanPhone}`);
        return { isValid: true };
    }, []);

    const validateLoanAmount = useCallback((amount: string): { isValid: boolean; error?: string } => {
        console.log(`🔍 [VALIDATION] Validando cantidad: ${amount}`);
        
        // Convertir a número
        const numericAmount = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        if (isNaN(numericAmount)) {
            const error = "La cantidad debe ser un número válido";
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        // Validar rango mínimo y máximo
        const minAmount = 50000; // $50,000 COP
        const maxAmount = 50000000; // $50,000,000 COP

        if (numericAmount < minAmount) {
            const error = `La cantidad mínima es $${minAmount.toLocaleString('es-CO')} COP`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        if (numericAmount > maxAmount) {
            const error = `La cantidad máxima es $${maxAmount.toLocaleString('es-CO')} COP`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        console.log(`✅ [VALIDATION] Cantidad válida: $${numericAmount.toLocaleString('es-CO')} COP`);
        return { isValid: true };
    }, []);

    const validateBankAccount = useCallback((account: string): { isValid: boolean; error?: string } => {
        console.log(`🔍 [VALIDATION] Validando cuenta bancaria: ${account}`);
        
        // Remover espacios
        const cleanAccount = account.replace(/\s+/g, '');
        
        // Validar que tenga entre 6 y 20 dígitos
        if (cleanAccount.length < 6 || cleanAccount.length > 20) {
            const error = `La cuenta bancaria debe tener entre 6 y 20 dígitos. Actual: ${cleanAccount.length}`;
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        // Validar que sean solo números
        if (!/^\d+$/.test(cleanAccount)) {
            const error = "La cuenta bancaria solo puede contener números";
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        console.log(`✅ [VALIDATION] Cuenta bancaria válida: ${cleanAccount}`);
        return { isValid: true };
    }, []);

    const validateSignature = useCallback((signature: string | null): { isValid: boolean; error?: string } => {
        console.log(`🔍 [VALIDATION] Validando firma:`, signature ? "Presente" : "Ausente");
        
        if (!signature) {
            const error = "Debes proporcionar una firma";
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        // Validar que la firma tenga contenido (más que solo espacios)
        if (signature.trim().length < 10) {
            const error = "La firma parece muy corta. Por favor firma nuevamente";
            console.error(`❌ [VALIDATION] ${error}`);
            return { isValid: false, error };
        }

        console.log(`✅ [VALIDATION] Firma válida`);
        return { isValid: true };
    }, []);

    const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
        console.log("🔍 [VALIDATION] Iniciando validación completa del formulario...");
        const errors: string[] = [];

        // Validar términos y condiciones
        if (!state.acceptedTerms) {
            errors.push("Debes aceptar los términos y condiciones");
        }

        // Validar teléfonos
        if (state.formData.phone.length < 2) {
            errors.push("Debes agregar al menos 2 números de contacto");
        } else {
            state.formData.phone.forEach((phone, index) => {
                const phoneValidation = validatePhoneNumber(phone);
                if (!phoneValidation.isValid) {
                    errors.push(`Teléfono ${index + 1}: ${phoneValidation.error}`);
                }
            });
        }

        // Validar campos obligatorios
        if (!state.formData.entity) {
            errors.push("Debes seleccionar una entidad bancaria");
        }

        if (!state.formData.bankNumberAccount) {
            errors.push("Debes ingresar el número de cuenta bancaria");
        } else {
            const accountValidation = validateBankAccount(state.formData.bankNumberAccount);
            if (!accountValidation.isValid) {
                errors.push(accountValidation.error!);
            }
        }

        if (!state.formData.cantity) {
            errors.push("Debes ingresar la cantidad del préstamo");
        } else {
            const amountValidation = validateLoanAmount(state.formData.cantity);
            if (!amountValidation.isValid) {
                errors.push(amountValidation.error!);
            }
        }

        if (!state.formData.city) {
            errors.push("Debes ingresar la ciudad");
        }

        if (!state.formData.residence_address) {
            errors.push("Debes ingresar la dirección de residencia");
        }

        // Validar firma
        const signatureValidation = validateSignature(state.formData.signature);
        if (!signatureValidation.isValid) {
            errors.push(signatureValidation.error!);
        }

        // Validar archivos para usuarios no valor_agregado
        const isValorAgregado = userComplete?.currentCompanie === "valor_agregado";
        if (!isValorAgregado) {
            const fileFields: FileField[] = ['labor_card', 'fisrt_flyer', 'second_flyer', 'third_flyer'];
            fileFields.forEach(field => {
                const file = state.formData[field];
                if (!file) {
                    errors.push(`Debes subir el archivo: ${field.replace('_', ' ')}`);
                } else {
                    const fileValidation = validateFile(file, field);
                    if (!fileValidation.isValid) {
                        errors.push(fileValidation.error!);
                    }
                }
            });
        }

        // Validar tamaño total de archivos
        if (!isValorAgregado) {
            const fileFields: FileField[] = ['labor_card', 'fisrt_flyer', 'second_flyer', 'third_flyer'];
            let totalSize = 0;
            fileFields.forEach(field => {
                const file = state.formData[field];
                if (file) totalSize += file.size;
            });

            const maxTotalSize = 45 * 1024 * 1024; // 45MB
            if (totalSize > maxTotalSize) {
                errors.push(`El tamaño total de archivos excede 45MB. Actual: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
            }
        }

        const isValid = errors.length === 0;
        console.log(`${isValid ? '✅' : '❌'} [VALIDATION] Validación completada:`, {
            isValid,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : "Sin errores"
        });

        return { isValid, errors };
    }, [state.formData, state.acceptedTerms, userComplete, validateFile, validatePhoneNumber, validateLoanAmount, validateBankAccount, validateSignature]);

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

    // Funciones para manejar números de teléfono con validación
    const addPhoneNumber = useCallback((phoneNumber: string) => {
        if (phoneNumber.trim() && !state.formData.phone.includes(phoneNumber.trim())) {
            const validation = validatePhoneNumber(phoneNumber.trim());
            if (!validation.isValid) {
                alert(validation.error);
                return;
            }
            
            updateFormData({
                phone: [...state.formData.phone, phoneNumber.trim()]
            });
            console.log(`✅ [PHONE] Teléfono agregado: ${phoneNumber.trim()}`);
        }
    }, [state.formData.phone, updateFormData, validatePhoneNumber]);

    const removePhoneNumber = useCallback((index: number) => {
        const phoneToRemove = state.formData.phone[index];
        const newPhones = state.formData.phone.filter((_, i) => i !== index);
        updateFormData({ phone: newPhones });
        console.log(`🗑️ [PHONE] Teléfono removido: ${phoneToRemove}`);
    }, [state.formData.phone, updateFormData]);

    const editPhoneNumber = useCallback((index: number, newPhone: string) => {
        if (newPhone.trim()) {
            const validation = validatePhoneNumber(newPhone.trim());
            if (!validation.isValid) {
                alert(validation.error);
                return;
            }
            
            const newPhones = [...state.formData.phone];
            newPhones[index] = newPhone.trim();
            updateFormData({ phone: newPhones });
            console.log(`✏️ [PHONE] Teléfono editado: ${newPhone.trim()}`);
        }
    }, [state.formData.phone, updateFormData, validatePhoneNumber]);

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
        if (file) {
            const validation = validateFile(file, field);
            if (!validation.isValid) {
                alert(validation.error);
                return;
            }
        }
        updateFormData({ [field]: file });
    }, [updateFormData, validateFile]);

    // Funciones de utilidad para formatear datos
    const formatPhoneNumber = useCallback((phone: string): string => {
        // Limpiar el número
        const cleaned = phone.replace(/\D/g, '');
        
        // Formatear según el patrón colombiano
        if (cleaned.length >= 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        } else if (cleaned.length >= 7) {
            return cleaned.replace(/(\d{3})(\d{4})/, '$1 $2');
        }
        
        return cleaned;
    }, []);

    const formatCurrency = useCallback((amount: string): string => {
        // Remover caracteres no numéricos excepto comas y puntos
        const cleaned = amount.replace(/[^\d.,]/g, '');
        
        // Convertir a número
        const numericAmount = parseFloat(cleaned.replace(',', '.'));
        
        if (isNaN(numericAmount)) return '';
        
        // Formatear con separadores de miles
        return numericAmount.toLocaleString('es-CO');
    }, []);

    const cleanBankAccount = useCallback((account: string): string => {
        // Solo permitir números y espacios
        return account.replace(/[^\d\s]/g, '');
    }, []);

    // Función para obtener el estado de validación de un campo específico
    const getFieldValidationStatus = useCallback((field: keyof FormDataProps): { isValid: boolean; error?: string } => {
        switch (field) {
            case 'bankNumberAccount':
                return state.formData.bankNumberAccount ? validateBankAccount(state.formData.bankNumberAccount) : { isValid: true };
            case 'cantity':
                return state.formData.cantity ? validateLoanAmount(state.formData.cantity) : { isValid: true };
            case 'signature':
                return validateSignature(state.formData.signature);
            default:
                return { isValid: true };
        }
    }, [state.formData, validateBankAccount, validateLoanAmount, validateSignature]);

    // Función para enviar el formulario
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("🚀 [FORM_SUBMIT] Iniciando envío del formulario...");
        console.log("📋 [FORM_SUBMIT] Estado actual:", {
            acceptedTerms: state.acceptedTerms,
            phoneCount: state.formData.phone.length,
            hasSignature: !!state.formData.signature,
            hasEntity: !!state.formData.entity,
            hasBankAccount: !!state.formData.bankNumberAccount,
            hasCantity: !!state.formData.cantity,
            userComplete: !!userComplete,
            userId: userComplete?.id,
            currentCompany: userComplete?.currentCompanie
        });

        // Usar la función de validación completa del lado del cliente
        const validation = validateForm();
        if (!validation.isValid) {
            console.error("❌ [FORM_SUBMIT] Validaciones del lado del cliente fallaron:", validation.errors);
            
            // Mostrar todos los errores de validación
            const errorMessage = validation.errors.join('\n• ');
            alert(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`);
            return;
        }

        console.log("✅ [FORM_SUBMIT] Todas las validaciones del lado del cliente pasaron correctamente");

        try {
            updateState({ isCreating: true });
            console.log("🔄 [FORM_SUBMIT] Estado actualizado: isCreating = true");

            const apiFormData = new FormData();

            // Archivos con logging detallado
            const fileFields: FileField[] = ['labor_card', 'fisrt_flyer', 'second_flyer', 'third_flyer'];
            let totalFileSize = 0;
            
            fileFields.forEach(field => {
                const file = state.formData[field];
                if (file) {
                    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                    totalFileSize += file.size;
                    console.log(`📁 [FORM_SUBMIT] Archivo ${field}:`, {
                        name: file.name,
                        size: `${fileSizeMB}MB`,
                        type: file.type
                    });
                    apiFormData.append(field, file);
                } else {
                    console.log(`📁 [FORM_SUBMIT] Archivo ${field}: No proporcionado`);
                }
            });

            console.log(`📊 [FORM_SUBMIT] Tamaño total de archivos: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB`);

            // Datos de texto con logging
            if (state.formData.signature) {
                console.log("✍️ [FORM_SUBMIT] Firma proporcionada:", state.formData.signature.substring(0, 50) + "...");
                apiFormData.append('signature', state.formData.signature);
            }

            // Convertir array de teléfonos a string para el envío
            const phoneJson = JSON.stringify(state.formData.phone);
            console.log("📞 [FORM_SUBMIT] Teléfonos:", state.formData.phone);
            
            // Determinar si es usuario valor_agregado
            const isValorAgregado = userComplete?.currentCompanie === "valor_agregado";
            
            apiFormData.append('phone', phoneJson);
            apiFormData.append('user_id', userComplete?.id as string);
            apiFormData.append('entity', state.formData.entity);
            apiFormData.append('bankNumberAccount', state.formData.bankNumberAccount);
            apiFormData.append('cantity', state.formData.cantity);
            apiFormData.append('terms_and_conditions', state.formData.terms_and_conditions.toString());
            apiFormData.append('isValorAgregado', isValorAgregado.toString());
            apiFormData.append('city', state.formData.city);
            apiFormData.append('residence_address', state.formData.residence_address);

            console.log("📤 [FORM_SUBMIT] Datos del formulario preparados:", {
                phone: state.formData.phone,
                entity: state.formData.entity,
                bankNumberAccount: state.formData.bankNumberAccount,
                cantity: state.formData.cantity,
                city: state.formData.city,
                residence_address: state.formData.residence_address,
                terms_and_conditions: state.formData.terms_and_conditions,
                isValorAgregado,
                userId: userComplete?.id
            });

            console.log("🌐 [FORM_SUBMIT] Enviando solicitud a /api/loan...");
            const startTime = Date.now();

            const response = await axios.post("/api/loan", apiFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`⏱️ [FORM_SUBMIT] Respuesta recibida en ${duration}ms:`, {
                status: response.status,
                success: response.data.success,
                data: response.data
            });

            if (response.data.success) {
                console.log("✅ [FORM_SUBMIT] Solicitud exitosa:", response.data.loanDetails);
                storeLoanData(response.data.loanDetails);
                updateState({
                    preLoanId: response.data.loanDetails.loanId,
                    isSuccessPreCreate: true,
                    isCreating: false
                });
                console.log("🎉 [FORM_SUBMIT] Estado actualizado para mostrar pantalla de verificación");
            } else {
                console.error("❌ [FORM_SUBMIT] Error en la respuesta del servidor:", response.data.error);
                alert("Error al crear el préstamo: " + response.data.error);
                updateState({ isCreating: false });
            }
        } catch (error: any) {
            console.error("💥 [FORM_SUBMIT] Error capturado:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code,
                stack: error.stack
            });

            // Determinar el tipo de error para mostrar mensaje específico
            let errorMessage = "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.";
            
            if (error.response?.status === 401) {
                errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
                console.error("🔐 [FORM_SUBMIT] Error de autenticación - Token expirado o inválido");
            } else if (error.response?.status === 413) {
                errorMessage = "Los archivos son demasiado grandes. Por favor reduce el tamaño de los archivos.";
                console.error("📦 [FORM_SUBMIT] Error de tamaño - Archivos demasiado grandes");
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.error || "Datos inválidos. Por favor revisa la información.";
                console.error("📝 [FORM_SUBMIT] Error de validación - Datos inválidos");
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "La solicitud tardó demasiado tiempo. Por favor intenta nuevamente.";
                console.error("⏰ [FORM_SUBMIT] Error de timeout - Solicitud tardó demasiado");
            } else if (error.response?.status >= 500) {
                errorMessage = "Error del servidor. Por favor intenta más tarde.";
                console.error("🖥️ [FORM_SUBMIT] Error del servidor - Problema interno");
            }

            alert(errorMessage);
            updateState({ isCreating: false });
        }
    }, [state.formData, state.acceptedTerms, userComplete, storeLoanData, updateState]);

    // Verificación de token
    const handleVerifyToken = useCallback(async (token: string) => {
        console.log("🔐 [TOKEN_VERIFY] Iniciando verificación de token...");
        console.log("🔑 [TOKEN_VERIFY] Datos de verificación:", {
            tokenLength: token.length,
            tokenPreview: token.substring(0, 3) + "***",
            preLoanId: state.preLoanId,
            userId: userComplete?.id
        });

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

            console.log("✅ [TOKEN_VERIFY] Respuesta de verificación:", {
                success: response.data.success,
                status: response.status,
                data: response.data
            });

            return response.data.success ? response.data.data : false;
        } catch (error: any) {
            console.error("💥 [TOKEN_VERIFY] Error en verificación:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code
            });

            // Determinar el tipo de error específico
            if (error.response?.status === 401) {
                console.error("🔐 [TOKEN_VERIFY] Error de autenticación - Token expirado");
            } else if (error.response?.status === 400) {
                console.error("📝 [TOKEN_VERIFY] Error de validación - Token inválido");
            } else if (error.response?.status === 404) {
                console.error("🔍 [TOKEN_VERIFY] Error de búsqueda - Préstamo no encontrado");
            } else if (error.response?.status >= 500) {
                console.error("🖥️ [TOKEN_VERIFY] Error del servidor");
            }

            alert("Ocurrió un error al verificar el token. Por favor intenta nuevamente.");
            return false;
        }
    }, [state.preLoanId, userComplete?.id]);

    const handleCodeChange = useCallback((code: string) => {
        updateState({ preToken: code });
    }, [updateState]);

    const sentToken = useCallback(async () => {
        console.log("📤 [SEND_TOKEN] Iniciando envío de token...");
        console.log("🔢 [SEND_TOKEN] Estado del token:", {
            tokenLength: state.preToken?.length,
            tokenPreview: state.preToken?.substring(0, 3) + "***",
            isValidLength: state.preToken?.length === 6
        });

        if (!state.preToken || state.preToken.length !== 6) {
            if (state.preToken?.length !== 6) {
                console.warn("⚠️ [SEND_TOKEN] Token inválido - debe tener 6 dígitos");
            }
            return;
        }

        console.log("🔄 [SEND_TOKEN] Token válido, procediendo con verificación...");
        const resToken = await handleVerifyToken(state.preToken);

        if (resToken) {
            console.log("✅ [SEND_TOKEN] Verificación exitosa, actualizando estado...");
            updateState({
                isSuccessPreCreate: false,
                preLoanId: null,
                isSuccessVerifyToken: true,
                preToken: null
            });
            localStorage.removeItem(STORAGE_KEY);
            console.log("🗑️ [SEND_TOKEN] Datos de préstamo eliminados del localStorage");

            const redirectTimer = setTimeout(() => {
                console.log("🏠 [SEND_TOKEN] Redirigiendo al panel...");
                router.push("/panel");
            }, 4000);
            return () => clearTimeout(redirectTimer);
        } else {
            console.error("❌ [SEND_TOKEN] Verificación fallida, limpiando token");
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
        handleFieldChange,

        // Nuevas funciones de validación
        validateForm,
        validateFile,
        validatePhoneNumber,
        validateLoanAmount,
        validateBankAccount,
        validateSignature,
        getFieldValidationStatus,

        // Funciones de utilidad
        formatPhoneNumber,
        formatCurrency,
        cleanBankAccount
    };
}

export default useFormReq;