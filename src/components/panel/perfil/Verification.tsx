"use client"

import usePanel, { FileChangeEvent } from "@/hooks/usePanel";
import {
    CircleCheck,
    CircleX,
    Fingerprint,
    ScanFace,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import axios from "axios";
import HeaderTitlesPerfil from "./headers";

function VerificationPerfil() {
    const { userComplete, refreshUserData } = usePanel();
    const fileSelfieInputRef = useRef<HTMLInputElement>(null);
    const fileDocsInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState<{ selfie: boolean, docs: boolean }>({
        selfie: false,
        docs: false
    });

    const [uploadStatus, setUploadStatus] = useState<{
        selfie: 'idle' | 'success' | 'error',
        docs: 'idle' | 'success' | 'error'
    }>({
        selfie: 'idle',
        docs: 'idle'
    });

    const handleDocsUpload = async (e: FileChangeEvent): Promise<void> => {
        const file: File | null = e.target.files?.[0] || null;
        if (!file || !userComplete?.Document?.[0]?.id) return;

        try {
            setIsUploading(prev => ({ ...prev, docs: true }));

            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", userComplete.id);

            const response = await axios.post("/api/auth/me/docs/papers", formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            console.log("Documento subido exitosamente:", response.data);
            setUploadStatus(prev => ({ ...prev, docs: 'success' }));

            // Aquí podrías actualizar el estado de userComplete si es necesario
            refreshUserData();

        } catch (error) {
            console.error("Error al subir el documento:", error);
            setUploadStatus(prev => ({ ...prev, docs: 'error' }));
        } finally {
            setIsUploading(prev => ({ ...prev, docs: false }));
        }
    };

    const handleSelfieUpload = async (e: FileChangeEvent): Promise<void> => {
        const file: File | null = e.target.files?.[0] || null;
        if (!file || !userComplete?.Document?.[0]?.id) return;

        try {
            setIsUploading(prev => ({ ...prev, selfie: true }));

            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", userComplete.id);

            const response = await axios.post("/api/auth/me/docs/selfie", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            console.log("Selfie subida exitosamente:", response.data);
            setUploadStatus(prev => ({ ...prev, selfie: 'success' }));

            // Aquí podrías actualizar el estado de userComplete si es necesario
            refreshUserData()

        } catch (error) {
            console.error("Error al subir la selfie:", error);
            setUploadStatus(prev => ({ ...prev, selfie: 'error' }));
        } finally {
            setIsUploading(prev => ({ ...prev, selfie: false }));
        }
    };

    // Si no hay datos de usuario, no renderizamos nada
    if (!userComplete) return null;

    // Verificamos si el usuario tiene documentos
    const hasDocument = userComplete.Document && userComplete.Document.length > 0;
    const document = hasDocument ? userComplete.Document[0] : null;

    // Estados de verificación para los documentos
    const selfieVerified = document?.imageWithCC !== "No definido";
    const docsVerified = document?.documentSides !== "No definido";

    return (
        <>
            <HeaderTitlesPerfil
                title={"Validaciones de identidad"}
                bio={"Confirmamos que la identidad del cliente sea real y segura."}
            />

            <div className="space-y-6 flex flex-col">
                {/* Sección de Selfie */}
                <div className="flex flex-row space-x-5 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="grid place-content-center">
                        <ScanFace className="drop-shadow-md dark:text-white" />
                    </div>
                    <div className="grow">
                        <h3 className="text-1xl font-semibold text-gray-700 dark:text-gray-200">Selfie con documento</h3>
                        <p className="text-sm font-thin dark:text-gray-300">Toma una selfie mostrando el documento del lado frontal</p>
                        <div className="flex justify-start mt-1 mb-3">
                            <div className="flex flex-row gap-1">
                                <div className="grid place-content-center">
                                    {!selfieVerified
                                        ? <ShieldAlert className="text-red-400 drop-shadow-md" size={13} />
                                        : <ShieldCheck className="text-green-400 drop-shadow-md" size={13} />}
                                </div>
                                <p className="font-thin text-gray-500 text-xs dark:text-gray-400">
                                    {!selfieVerified ? "No Verificado" : "Verificado"}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-start mt-2">
                            <div className="flex flex-row gap-2">
                                <button
                                    className={`bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 text-xs py-1 px-3 rounded-md text-gray-500 dark:text-gray-300 cursor-pointer ${isUploading.selfie ? 'opacity-50 cursor-wait' : ''}`}
                                    onClick={() => fileSelfieInputRef.current?.click()}
                                    disabled={isUploading.selfie}
                                >
                                    {isUploading.selfie ? 'Subiendo...' : selfieVerified ? 'Repetir' : 'Verificar'}
                                </button>
                                {uploadStatus.selfie === 'error' && (
                                    <span className="text-xs text-red-500 self-center">Error al subir</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid place-content-center ml-5">
                        {selfieVerified && <CircleCheck className="text-green-600 drop-shadow-md" />}
                        {!selfieVerified && <CircleX className="text-red-600 drop-shadow-md" />}
                    </div>
                </div>

                {/* Sección de Documentos */}
                <div className="flex flex-row space-x-5 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="grid place-content-center">
                        <Fingerprint className="drop-shadow-md dark:text-white" />
                    </div>
                    <div className="grow">
                        <h3 className="text-1xl font-semibold text-gray-700 dark:text-gray-200">Documento por ambos lados</h3>
                        <p className="text-sm font-thin dark:text-gray-300">Sube un PDF con ambas caras de tu documento de identidad escaneadas.</p>
                        <div className="flex justify-start mt-1 mb-3">
                            <div className="flex flex-row gap-1">
                                <div className="grid place-content-center">
                                    {!docsVerified
                                        ? <ShieldAlert className="text-red-400 drop-shadow-md" size={13} />
                                        : <ShieldCheck className="text-green-400 drop-shadow-md" size={13} />}
                                </div>
                                <p className="font-thin text-gray-500 dark:text-gray-400 text-xs">
                                    {!docsVerified ? "No Verificado" : "Verificado"}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-start mt-2">
                            <div className="flex flex-row gap-2">
                                <button
                                    className={`bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 text-xs py-1 px-3 rounded-md text-gray-500 dark:text-gray-300 cursor-pointer ${isUploading.docs ? 'opacity-50 cursor-wait' : ''}`}
                                    onClick={() => fileDocsInputRef.current?.click()}
                                    disabled={isUploading.docs}
                                >
                                    {isUploading.docs ? 'Subiendo...' : docsVerified ? 'Repetir' : 'Verificar'}
                                </button>
                                {uploadStatus.docs === 'error' && (
                                    <span className="text-xs text-red-500 self-center">Error al subir</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid place-content-center ml-5">
                        {docsVerified && <CircleCheck className="text-green-600 drop-shadow-md" />}
                        {!docsVerified && <CircleX className="text-red-600 drop-shadow-md" />}
                    </div>
                </div>
            </div>

            {/* Inputs ocultos para seleccionar archivos */}
            <input
                type="file"
                accept="image/*"
                ref={fileSelfieInputRef}
                className="hidden"
                onChange={handleSelfieUpload}
            />

            <input
                type="file"
                accept="application/pdf"
                ref={fileDocsInputRef}
                className="hidden"
                onChange={handleDocsUpload}
            />
        </>
    )
}

export default VerificationPerfil;