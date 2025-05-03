// components/panel/PerfilFormInput.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { CircleCheck, TriangleAlert, Loader2 } from 'lucide-react';

interface FormInputProps {
  label: string;
  initialValue: string;
  required?: boolean;
  type?: string;
  onUpdate: (fieldName: string, value: string) => Promise<boolean>;
  fieldName: string;
  isValid: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  initialValue = '',
  required = false,
  type = 'text',
  onUpdate,
  fieldName,
  isValid
}) => {
  // Estado local para el valor que escribe el usuario
  const [inputValue, setInputValue] = useState(initialValue === null ? '' : initialValue);
  // Estado para saber si estamos actualizando
  const [isUpdating, setIsUpdating] = useState(false);
  // Referencia para el timeout de debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // Estado para mostrar el éxito o error
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Bandera para controlar si debemos actualizar el inputValue cuando cambia initialValue
  const ignoreNextInitialValueUpdate = useRef(false);
  // Estado para controlar si los cambios están guardados
  const [isPendingSave, setIsPendingSave] = useState(false);
  // Timeout para resetear mensajes de estado
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Estado local para validación
  const [localIsValid, setLocalIsValid] = useState(isValid);

  // Actualizar el valor de entrada si el initialValue cambia y NO estamos en medio de una edición
  useEffect(() => {
    if (ignoreNextInitialValueUpdate.current) {
      ignoreNextInitialValueUpdate.current = false;
      return;
    }

    const valueToSet = initialValue === null ? '' : initialValue;

    // Para las fechas, convertir de formato ISO a YYYY-MM-DD si es necesario
    if (type === 'date' && valueToSet && valueToSet.includes('T')) {
      try {
        const date = new Date(initialValue);
        const formattedDate = date.toISOString().split('T')[0];
        setInputValue(formattedDate);
      } catch (e) {
        setInputValue(initialValue);
      }
    } else {
      setInputValue(initialValue);
    }

    // Also reset pending save state when initialValue changes externally
    setIsPendingSave(false);
  }, [initialValue]);

  // Sincronizar isValid prop con estado local
  useEffect(() => {
    // Solo actualizar si no hay pendientes de guardar
    if (!isPendingSave) {
      setLocalIsValid(isValid);
    }
  }, [isValid, isPendingSave]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Comprobar si el campo es válido basado en su valor actual
  const validateField = (value: string): boolean => {
    if (value === '') return required ? false : true;
    if (required && value.trim() === '') return false;
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Actualizar inmediatamente el valor mostrado

    // Realizar validación local para UI inmediata
    const currentlyValid = validateField(newValue);
    setLocalIsValid(currentlyValid);

    setIsPendingSave(newValue !== initialValue);

    // Cancelar cualquier timeout previo
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Configurar un nuevo debounce
    debounceTimeout.current = setTimeout(() => {
      saveInputValue(newValue);
    }, 1500); // Esperar 1.5 segundos antes de guardar
  };

  const saveInputValue = async (valueToSave: string) => {
    // No hacer nada si el valor es igual al initialValue
    if (valueToSave === initialValue) {
      return;
    }

    setIsUpdating(true);
    setUpdateStatus('idle');

    try {
      // ¡Importante! Indicar que queremos ignorar la próxima actualización de initialValue
      ignoreNextInitialValueUpdate.current = true;

      const success = await onUpdate(fieldName, valueToSave);

      if (success) {
        setUpdateStatus('success');
        setIsPendingSave(false);

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
      debounceTimeout.current = null;
    }
  };

  const handleBlur = () => {
    // Si hay un timeout pendiente, ejecutar la actualización inmediatamente
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
      saveInputValue(inputValue);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={fieldName}
          name={fieldName}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm 
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
            dark:placeholder-gray-400 dark:focus:ring-offset-gray-900
            focus:outline-none focus:ring-2 
            transition-colors duration-200
            font-thin
            ${isPendingSave ? 'border-yellow-400 dark:border-yellow-500 focus:ring-yellow-400 dark:focus:ring-yellow-500' : ''}
            ${!isPendingSave && localIsValid ? 'border-green-500 dark:border-green-600 focus:ring-green-500 dark:focus:ring-green-600' : ''}
            ${!isPendingSave && !localIsValid && required ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600' : ''}
            ${!isPendingSave && !localIsValid && !required ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600' : ''}
          `}
          // Remove right padding for date inputs to prevent the calendar selector from being covered
          style={{
            ...(type === 'date' ? { paddingRight: '0.75rem' } : {})
          }}
        />
        {/* Moved status icons outside the input for date types */}
        {type !== 'date' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isUpdating && (
              <Loader2 className="h-4 w-4 text-gray-400 dark:text-gray-400 animate-spin" />
            )}
            {!isUpdating && localIsValid && !isPendingSave && (
              <CircleCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
            )}
            {!isUpdating && !localIsValid && required && !isPendingSave && (
              <TriangleAlert className="h-4 w-4 text-red-500 dark:text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Display status icons below the input for date types */}
      {type === 'date' && (
        <div className="flex items-center mt-1">
          {isUpdating && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span className="text-xs">Actualizando...</span>
            </div>
          )}
          {!isUpdating && localIsValid && !isPendingSave && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CircleCheck className="h-4 w-4 mr-1" />
              <span className="text-xs">Válido</span>
            </div>
          )}
          {!isUpdating && !localIsValid && required && !isPendingSave && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <TriangleAlert className="h-4 w-4 mr-1" />
              <span className="text-xs">Requerido</span>
            </div>
          )}
        </div>
      )}

      {isPendingSave && (
        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
          Cambios pendientes de guardar
        </p>
      )}
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

export default FormInput;