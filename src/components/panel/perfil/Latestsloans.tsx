"use client";

import { ArrowUpRight, FilePlus2, RefreshCcw } from "lucide-react";
import HeaderTitlesPerfil from "./headers";
import usePanel from "@/hooks/usePanel";
import { useEffect } from "react";

function LatestLoan() {
    const {
        router,
        dataReady,
        allFieldsComplete,
        latestLoan,
        loanMessage,
        isLoadingLoan,
        toggleNewReq,
        refreshUserData,
    } = usePanel();

    // Render helper for new loan request button
    const renderNewLoanButton = () => (
        <button
            onClick={() => toggleNewReq(false)}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 w-full mt-4"
        >
            <FilePlus2 className="w-5 h-5" />
            <span>Solicitar nuevo préstamo</span>
        </button>
    );

    // Set up an effect to refresh user data when profile fields change
    useEffect(() => {
        // Create an event listener for profile updates
        const handleProfileUpdate = () => {
            refreshUserData();
        };

        // Listen for a custom event that will be triggered when profile is updated
        window.addEventListener('profile-updated', handleProfileUpdate);

        // Clean up the event listener when component unmounts
        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, [refreshUserData]);

    // Render helper for loan display section
    const renderLoanSection = () => {
        if (isLoadingLoan) {
            return (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-center text-gray-500 dark:text-gray-400">Cargando información de préstamos...</p>
                </div>
            );
        }

        if (!latestLoan || latestLoan === "" || typeof latestLoan === "string") {
            return (
                <div className="dark:bg-gray-800 rounded-lg mb-6 mt-2 flex flex-row justify-between bg-gray-50 px-4 py-3 border border-gray-100 dark:border-gray-800 gap-5">
                    <div>
                        <div className="flex flex-row gap-1">
                            <h3 className="text-lg font-semibold mb-0.5 text-gray-800 dark:text-gray-200 grid place-content-center">Sin Prestamos Activos</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Realiza un prestamo en menos de 5 minutos
                        </p>
                    </div>
                    <div className="grid place-content-center">
                        <div
                            className="hover:bg-gray-100 cursor-pointer rounded-md border border-gray-200 shadow p-1"
                            onClick={() => router.push('/panel/nueva-solicitud')}
                        >
                            <ArrowUpRight size={20} className="text-red-400 drop-shadow-md" />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Tu préstamo actual</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monto</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">${latestLoan.cantity}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{latestLoan.status || "En proceso"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de solicitud</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(latestLoan.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                {renderNewLoanButton()}
            </div>
        );
    };

    return (
        <>
            <HeaderTitlesPerfil
                title="Préstamos"
                bio="Administra tus préstamos activos y solicita nuevos préstamos"
            />

            {/* Redirect if user profile is incomplete */}
            {dataReady && allFieldsComplete && (
                <div className="mb-6">
                    {renderLoanSection()}
                </div>
            )}

            {/* Show message if profile is incomplete */}
            {dataReady && !allFieldsComplete && (
                <div className="dark:bg-gray-800 rounded-lg mb-6 mt-2 flex flex-row justify-between bg-gray-50 px-4 py-3 border border-gray-100 dark:border-gray-800 gap-5">
                    <div>
                        <div className="flex flex-row gap-1">
                            <h3 className="text-lg font-semibold mb-0.5 text-gray-800 dark:text-gray-200 grid place-content-center">Perfil incompleto</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Completa tu perfil para poder solicitar préstamos.
                        </p>
                        <p className="text-xs mt-2 text-gray-400">¡Datos listos? Recarga o pulsa para verificar.</p>
                    </div>
                    <div className="grid place-content-center">
                        <div className="hover:bg-gray-100 cursor-pointer rounded-md border border-gray-200 shadow p-1"><RefreshCcw size={20} className="text-red-400 drop-shadow-md" /></div>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {!dataReady && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
                    <p className="text-center text-gray-500 dark:text-gray-400">Cargando información...</p>
                </div>
            )}
        </>
    );
}

export default LatestLoan;