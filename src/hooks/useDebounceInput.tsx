// hooks/useDebounceInput.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling input with debounced updates
 * @param initialValue - Initial value of the input
 * @param onUpdate - Function to call after debounce (e.g. API update)
 * @param delay - Debounce delay in milliseconds
 * @returns [value, setValue, isUpdating]
 */
export function useDebounceInput<T>(
  initialValue: T,
  onUpdate: (value: T) => Promise<void> | void,
  delay = 3000
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Ref para controlar si el valor ha cambiado realmente
  const previousValueRef = useRef<T>(initialValue);
  // Ref para evitar actualizaciones durante el montaje inicial
  const initialRender = useRef(true);
  // Ref para evitar actualizaciones múltiples con el mismo valor
  const updateInProgressRef = useRef(false);

  // Actualizar initialValue si cambia desde las props
  useEffect(() => {
    // Solo actualizamos el valor si no estamos en medio de una edición
    if (!isUpdating && initialValue !== value) {
      setValue(initialValue);
      setDebouncedValue(initialValue);
      previousValueRef.current = initialValue;
    }
  }, [initialValue, isUpdating]);

  // Actualizar debouncedValue después del delay
  useEffect(() => {
    // Si estamos editando, programamos el debounce
    if (value !== previousValueRef.current) {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  // Llamar a onUpdate cuando cambia debouncedValue
  useEffect(() => {
    // Saltamos el render inicial
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Saltamos si el valor no ha cambiado realmente
    if (debouncedValue === previousValueRef.current || updateInProgressRef.current) {
      return;
    }

    const updateData = async () => {
      updateInProgressRef.current = true;
      setIsUpdating(true);

      try {
        await onUpdate(debouncedValue);
        // Actualizamos el valor de referencia solo cuando la actualización fue exitosa
        previousValueRef.current = debouncedValue;
      } catch (error) {
        console.error("Failed to update:", error);
      } finally {
        setIsUpdating(false);
        updateInProgressRef.current = false;
      }
    };

    updateData();
  }, [debouncedValue, onUpdate]);

  return [value, setValue, isUpdating];
}

export default useDebounceInput;