// hooks/usePanelApi.ts
"use client"

import { useState, useRef } from 'react';
import usePanel from "@/hooks/usePanel";
import axios from 'axios';

interface IsUpdatingState {
    [key: string]: boolean;
}

type UpdateUserField = (fieldName: string, value: any) => Promise<boolean>;

/**
 * Custom hook to handle API updates for the panel
 */
function usePanelApi() {
    const { userComplete, refreshUserData } = usePanel();
    const [isUpdating, setIsUpdating] = useState<IsUpdatingState>({});
    const lastUpdatedValues = useRef<{ [key: string]: any }>({});
    const refreshInProgress = useRef<boolean>(false);

    // Track field validity separately from the API response
    const [fieldValidity, setFieldValidity] = useState<{ [key: string]: boolean }>({});

    /**
     * Update user field through API
     * @param {string} fieldName - The field to update
     * @param {any} value - The new value
     * @returns {Promise<boolean>} - Whether the update was successful
     */
    const updateUserField: UpdateUserField = async (fieldName: string, value: any): Promise<boolean> => {
        if (!userComplete?.id) {
            console.error("User ID is required");
            return false;
        }

        // If we're already updating this field, don't start another update
        if (isUpdating[fieldName]) {
            console.log(`Update for ${fieldName} already in progress`);
            return false;
        }

        // Check if we've already updated this field with this value
        if (lastUpdatedValues.current[fieldName] === value) {
            console.log(`Field ${fieldName} already updated with this value`);
            return true;
        }

        // Formato especial para fechas - guardando en formato ISO completo
        if (fieldName === 'birth_day' && value) {
            try {
                const date = new Date(value);
                // Asegurar que la fecha tiene hora, minutos, segundos y milisegundos
                // Establecer a mediodía para evitar problemas de zona horaria
                date.setHours(12, 0, 0, 0);
                // Formato ISO completo
                value = date.toISOString();
                console.log("Formato de fecha convertido:", value);
            } catch (error) {
                console.error("Error al formatear la fecha:", error);
                return false;
            }
        }

        // Update the field validity state immediately - this affects UI appearance
        const valid = isFieldValid(fieldName, value);
        setFieldValidity(prev => ({ ...prev, [fieldName]: valid }));

        setIsUpdating(prev => ({ ...prev, [fieldName]: true }));

        try {
            // Handle nested fields (Document[0].number)
            let payload: any;
            if (fieldName.includes('[')) {
                // Special case for document number
                if (fieldName.includes('Document[0].number')) {
                    // Use the proper Prisma nested update syntax
                    payload = {
                        field: 'Document',
                        value: {
                            update: {
                                where: { id: userComplete.Document[0].id },
                                data: { number: value }
                            }
                        }
                    };
                } else {
                    // Extract the correct field name for the API
                    const mainField = fieldName.split('[')[0];
                    payload = { field: mainField, value };
                }
            } else {
                payload = { field: fieldName, value };
            }

            // Log del payload para depuración
            console.log(`Enviando payload para ${fieldName}:`, payload);

            // Make the API request
            const response = await axios.put(
                `/api/auth/me?user_id=${userComplete.id}`,
                payload,
                { withCredentials: true }
            );

            // Check if response was successful
            const isSuccess = response.data?.success === true;

            if (isSuccess) {
                console.log(`Field ${fieldName} updated successfully to:`, value);
                lastUpdatedValues.current[fieldName] = value;

                // Solo refrescar los datos si no hay un refresh en progreso
                if (!refreshInProgress.current) {
                    refreshInProgress.current = true;
                    setTimeout(() => {
                        if (refreshUserData) {
                            refreshUserData();
                        }
                        refreshInProgress.current = false;
                    }, 1000);
                }
            } else {
                console.error("API returned error:", response.data?.error);
            }

            return isSuccess; // Just return the API success status, validity is tracked separately
        } catch (error: any) {
            console.error("Error updating field:", error.response?.data || error.message || error);
            return false;
        } finally {
            setTimeout(() => {
                setIsUpdating(prev => ({ ...prev, [fieldName]: false }));
            }, 300);
        }
    };

    /**
     * Validates if a field has a proper value
     * @param field Field name to validate
     * @param value Value to check
     * @returns Whether the field value is valid
     */
    const isFieldValid = (field: string, value: any): boolean => {
        // Optional field is always valid
        if (field === 'secondLastName') return true;

        // For empty strings, return false but don't throw errors
        if (value === '' || value === null || value === undefined) {
            return false;
        }

        // For string values
        if (typeof value === 'string') {
            // Consider "No definido" as invalid but not an error
            if (value === 'No definido' || value === 'No definidos') {
                return false;
            }
            return value.trim().length > 0;
        }

        // Special handling for date fields
        if (field === 'birthDate') {
            if (!value) return false;

            try {
                const date = new Date(value);
                return !isNaN(date.getTime());
            } catch {
                return false;
            }
        }

        return true;
    };

    /**
     * Check field validity - check both the tracked state and compute for the current value
     * @param fieldName The field to check
     * @param currentValue Current field value
     * @returns Whether the field is valid
     */
    const checkFieldValidity = (fieldName: string, currentValue: any): boolean => {
        // If we have stored validity for this field, use that
        if (fieldName in fieldValidity) {
            return fieldValidity[fieldName];
        }

        // Otherwise compute it fresh
        return isFieldValid(fieldName, currentValue);
    };

    /**
     * Formats field value for display or editing
     * @param field Field name
     * @param value Raw value
     * @returns Formatted value
     */
    const formatFieldValue = (field: string, value: any): string => {
        // Primero, verificar si el valor es null o undefined
        if (value === null || value === undefined) {
            return '';
        }

        if (field === 'birthDate' && value) {
            // Format date properly
            try {
                return new Date(value).toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        }

        if (typeof value === 'string' && (value === 'No definido' || value === 'No definidos')) {
            return '';
        }

        // Asegurarse de que el valor sea siempre un string
        return String(value);
    }

    return {
        userComplete,
        updateUserField,
        isFieldUpdating: (fieldName: string): boolean => isUpdating[fieldName] || false,
        isFieldValid: checkFieldValidity, // Use the new function that checks stored validity
        formatFieldValue,
    };
}

export default usePanelApi;