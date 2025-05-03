"use client"

import React, { useState, useRef, KeyboardEvent, useEffect } from "react";

// Componente para la entrada del código de verificación
function VerificationCodeInput({ onChange }: { onChange: (code: string) => void }) {
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Actualizar el estado padre cuando cambia el código
    useEffect(() => {
        onChange(code.join(""));
    }, [code, onChange]);

    // Manejar cambios en cualquier input
    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Si el usuario pega un valor con múltiples caracteres
            const chars = value.split("");
            const newCode = [...code];

            // Llenar los campos con los caracteres disponibles
            chars.forEach((char, charIndex) => {
                if (index + charIndex < 6) {
                    newCode[index + charIndex] = char;
                }
            });

            setCode(newCode);

            // Mover el foco al siguiente campo disponible o al último
            const nextIndex = Math.min(index + chars.length, 5);
            inputRefs.current[nextIndex]?.focus();
        } else {
            // Para entrada de un solo carácter
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Mover al siguiente input si hay un valor
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Manejar teclas especiales como Delete y Backspace
    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            // Si hay contenido en el input actual, borrarlo
            if (code[index]) {
                const newCode = [...code];
                newCode[index] = "";
                setCode(newCode);
            } else if (index > 0 && e.key === "Backspace") {
                // Si no hay contenido y es backspace, ir al anterior y borrarlo
                const newCode = [...code];
                newCode[index - 1] = "";
                setCode(newCode);
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            // Navegar a la izquierda
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            // Navegar a la derecha
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Pegar un código completo
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").trim();

        // Filtrar solo dígitos
        const digits = pastedData.replace(/\D/g, "").substring(0, 6);

        if (digits) {
            const newCode = Array(6).fill("");
            digits.split("").forEach((char, i) => {
                if (i < 6) newCode[i] = char;
            });

            setCode(newCode);

            // Mover el foco al último dígito o al siguiente espacio vacío
            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={digit}
                    maxLength={1}
                    className="w-12 dark:text-gray-400 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    required
                />
            ))}
        </div>
    );
}

export default VerificationCodeInput;