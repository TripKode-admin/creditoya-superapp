// components/panel/SelectInput.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { CircleCheck, TriangleAlert, Loader2, ChevronDown } from 'lucide-react';

interface SelectInputProps {
    label: string;
    initialValue: string;
    options: { value: string; label: string }[];
    required?: boolean;
    onUpdate: (fieldName: string, value: string) => Promise<boolean>;
    fieldName: string;
    isValid: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    initialValue = '',
    options,
    required = false,
    onUpdate,
    fieldName,
    isValid
}) => {
    // Estado local para el valor que selecciona el usuario
    const [selectValue, setSelectValue] = useState(initialValue);
    // Estado para saber si estamos actualizando
    const [isUpdating, setIsUpdating] = useState(false);
    // Estado para mostrar el éxito o error
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
    // Bandera para controlar si debemos actualizar el selectValue cuando cambia initialValue
    const ignoreNextInitialValueUpdate = useRef(false);
    // Timeout para resetear mensajes de estado
    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Estado local para validación
    const [localIsValid, setLocalIsValid] = useState(isValid);

    // Actualizar el valor si el initialValue cambia y NO estamos en medio de una selección
    useEffect(() => {
        if (ignoreNextInitialValueUpdate.current) {
            ignoreNextInitialValueUpdate.current = false;
            return;
        }

        setSelectValue(initialValue);
    }, [initialValue]);

    // Sincronizar isValid prop con estado local
    useEffect(() => {
        setLocalIsValid(isValid);
    }, [isValid]);

    // Limpiar timeouts al desmontar
    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectValue(newValue);

        // No actualizar si el valor no cambió
        if (newValue === initialValue) {
            return;
        }

        setIsUpdating(true);
        setUpdateStatus('idle');

        try {
            // Indicar que queremos ignorar la próxima actualización de initialValue
            ignoreNextInitialValueUpdate.current = true;

            const success = await onUpdate(fieldName, newValue);

            if (success) {
                setUpdateStatus('success');
                setLocalIsValid(true);

                // Auto-clear the success message after 3 seconds
                if (statusTimeoutRef.current) {
                    clearTimeout(statusTimeoutRef.current);
                }
                statusTimeoutRef.current = setTimeout(() => {
                    setUpdateStatus('idle');
                }, 3000);
            } else {
                setUpdateStatus('error');
            }
        } catch (error) {
            console.error(`Error updating ${fieldName}:`, error);
            setUpdateStatus('error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>
            <div className="relative">
                <select
                    id={fieldName}
                    name={fieldName}
                    value={selectValue}
                    onChange={handleSelectChange}
                    className={`
            block w-full px-3 py-2 border rounded-md shadow-sm appearance-none
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
            dark:placeholder-gray-400 dark:focus:ring-offset-gray-900
            focus:outline-none focus:ring-2 pr-10
            transition-colors duration-200
            ${localIsValid ? 'border-green-500 dark:border-green-600 focus:ring-green-500 dark:focus:ring-green-600' : ''}
            ${!localIsValid && required ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600' : ''}
            ${!localIsValid && !required ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600' : ''}
          `}
                >
                    <option value="">Seleccionar {label}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 text-gray-400 dark:text-gray-400 animate-spin" />
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-400" />
                            {!isUpdating && localIsValid && selectValue && (
                                <CircleCheck className="h-4 w-4 text-green-500 dark:text-green-400 ml-1" />
                            )}
                            {!isUpdating && !localIsValid && required && (
                                <TriangleAlert className="h-4 w-4 text-red-500 dark:text-red-400 ml-1" />
                            )}
                        </>
                    )}
                </div>
            </div>

            {updateStatus === 'error' && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Error al actualizar, intente de nuevo
                </p>
            )}
            {updateStatus === 'success' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Guardado correctamente
                </p>
            )}
        </div>
    );
};

export default SelectInput;