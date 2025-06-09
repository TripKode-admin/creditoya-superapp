"use client";

import { useState, useEffect, useRef } from "react";
import LoadingPanel from "@/components/panel/Loading";
import usePanel from "@/hooks/usePanel";
import VerificationPerfil from "@/components/panel/perfil/Verification";
import FormDatesPerfil from "@/components/panel/perfil/InputsGroup";
import PerfilAvatar from "@/components/panel/perfil/avatar";
import LatestLoan from "@/components/panel/perfil/Latestsloans";
import { ArrowLeft, UserCheck } from "lucide-react";
import usePanelApi from "@/hooks/usePanelApi";
import ProgressPerfilIndicator from "@/components/panel/perfil/ProgressIndicator";

function PanelPerfilUser() {
    const {
        userComplete,
        isLoading,
        isPending,
        dataReady,
        allFieldsComplete,
        router
    } = usePanel();

    const [isPageReady, setIsPageReady] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Ref para trackear el estado anterior de allFieldsComplete
    const prevAllFieldsComplete = useRef<boolean | null>(null);
    const hasShownCompletionModal = useRef<boolean>(false);

    // Use this effect to coordinate the rendering of all components
    useEffect(() => {
        if (dataReady && userComplete && !isLoading && !isPending) {
            // Add a small delay to ensure all components are ready to render
            const timer = setTimeout(() => {
                setIsPageReady(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setIsPageReady(false);
        }
    }, [dataReady, userComplete, isLoading, isPending]);

    // Show modal ONLY when user just completed ALL required fields
    useEffect(() => {
        console.log('Effect triggered:', {
            dataReady,
            allFieldsComplete,
            prevAllFieldsComplete: prevAllFieldsComplete.current,
            hasShownCompletionModal: hasShownCompletionModal.current
        });

        // Solo mostrar el modal si:
        // 1. Los datos están listos
        // 2. Todos los campos están completos ahora
        // 3. Antes NO estaban todos completos (transición de incompleto a completo)
        // 4. No hemos mostrado ya el modal de completitud
        if (
            dataReady &&
            allFieldsComplete &&
            prevAllFieldsComplete.current === false && // Cambio: verificar explícitamente false
            !hasShownCompletionModal.current
        ) {
            console.log('Showing completion modal');
            setShowModal(true);
            hasShownCompletionModal.current = true;
        }

        // Actualizar el estado anterior solo si dataReady es true
        if (dataReady) {
            prevAllFieldsComplete.current = allFieldsComplete;
        }
    }, [dataReady, allFieldsComplete]);

    // Reset the completion modal flag when fields become incomplete again
    useEffect(() => {
        if (!allFieldsComplete && dataReady) {
            hasShownCompletionModal.current = false;
        }
    }, [allFieldsComplete, dataReady]);

    // Close modal handler
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Modal con confeti
    const renderConfettiModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 flex items-center justify-center z-50 min-h-screen">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                            ¡Perfil Completado!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Has completado todos los campos requeridos. ¡Ahora puedes solicitar tu préstamo!
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    handleCloseModal();
                                    router.push('/panel/nueva-solicitud');
                                }}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                                Solicitar Préstamo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Show loading state if data is not ready
    if (!isPageReady) {
        return <LoadingPanel message={"Cargando datos del perfil"} />;
    }

    return (
        <>
            {/* Modal de confeti */}
            {renderConfettiModal()}

            <main className="min-h-dvh dark:bg-black pt-16 pb-12 px-4 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 lg:pt-32 lg:pb-24">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
                        <PerfilAvatar />
                        <FormDatesPerfil />
                        <VerificationPerfil />
                        <LatestLoan />
                    </div>
                </div>
            </main>
        </>
    );
}

export default PanelPerfilUser;