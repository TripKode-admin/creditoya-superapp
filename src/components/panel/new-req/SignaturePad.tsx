"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDarkMode } from "@/context/DarkModeContext";
import SignatureCanvas from "react-signature-canvas";
import type SignaturePadType from "react-signature-canvas";

interface SignaturePadProps {
  onSave?: (signature: string | null) => void;
  title?: string;
  required?: boolean;
}

/**
 * Componente simplificado de firma digital para Next.js 14 y Tailwind 4
 * - Siempre guarda la firma en negro independientemente del modo
 * - Usa react-signature-canvas para mayor robustez
 */
function SignaturePad({
  onSave,
  title = "Firma",
  required = false
}: SignaturePadProps) {
  const { darkmode } = useDarkMode();
  const sigCanvas = useRef<SignaturePadType>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Ajusta el color de la firma según el modo
  useEffect(() => {
    if (sigCanvas.current) {
      // En modo oscuro dibujamos en blanco para que se vea mejor
      // Accedemos al método getCanvas() para obtener el canvas interno y su contexto
      const canvas = sigCanvas.current.getCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = darkmode ? "#FFFFFF" : "#000000";
      }
    }
  }, [darkmode]);

  // Comprueba si el canvas está vacío
  const checkIfEmpty = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  // Guarda la firma siempre en negro
  const saveSignature = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        if (onSave) onSave(null);
        return;
      }

      // Si estamos en modo oscuro, necesitamos convertir la firma a negro
      if (darkmode) {
        // Obtener la firma como imagen
        const dataUrl = sigCanvas.current.toDataURL('image/png');
        
        // Crear un canvas temporal para procesar la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          if (!tempCtx) return;
          
          // Configurar el canvas temporal con las dimensiones de la imagen
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          
          // Dibujar la imagen en el canvas temporal
          tempCtx.drawImage(img, 0, 0);
          
          // Obtener los datos de la imagen
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          
          // Convertir píxeles blancos a negros (conservando alfa)
          for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) {
              data[i] = 0;     // R
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
              // Conservar alfa (data[i+3])
            }
          }
          
          tempCtx.putImageData(imageData, 0, 0);
          
          // Obtener la firma convertida a negro
          const blackSignature = tempCanvas.toDataURL('image/png');
          if (onSave) onSave(blackSignature);
        };
        
        img.src = dataUrl;
      } else {
        // Si estamos en modo claro, la firma ya es negra
        const dataUrl = sigCanvas.current.toDataURL('image/png');
        if (onSave) onSave(dataUrl);
      }
    }
  };

  // Limpia el canvas
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      if (onSave) onSave(null);
    }
  };

  // Cuando termina de dibujar, guarda la firma
  const handleEnd = () => {
    checkIfEmpty();
    saveSignature();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-medium dark:text-gray-300 text-gray-700">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h5>
      </div>

      <div className={`
        border rounded-md overflow-hidden relative
        ${darkmode ? 'border-gray-600' : 'border-gray-300'}
      `}>
        {/* Canvas de firma */}
        <div className="h-40 w-full relative">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: `absolute inset-0 w-full h-full ${darkmode ? 'bg-gray-800' : 'bg-white'}`
            }}
            onEnd={handleEnd}
          />
        </div>

        {/* Línea guía */}
        <div className={`absolute bottom-8 left-0 right-0 h-px ${darkmode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

        {/* Controles */}
        <div className={`
          flex justify-between items-center px-3 py-2 
          ${darkmode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}
          border-t ${darkmode ? 'border-gray-600' : 'border-gray-200'}
        `}>
          <span className="text-xs italic">
            {isEmpty ? 'Dibuje su firma aquí' : 'Firma registrada'}
          </span>
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className={`
              px-3 py-1 text-xs rounded-md transition-colors
              ${isEmpty
                ? `${darkmode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                : `${darkmode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
            `}
          >
            Borrar
          </button>
        </div>
      </div>

      {/* Indicación para dispositivos táctiles */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic block md:hidden">
        Use su dedo o stylus para firmar
      </p>
    </div>
  );
}

export default SignaturePad;