"use client";

import usePanel from "@/hooks/usePanel";
import MissingData from "@/components/panel/MissingData";
import LoadingPanel from "@/components/panel/Loading";
import { Plus } from "lucide-react";
import searchIlustration from "@/assets/ilustrations/Search.svg";
import Image from "next/image";
import HeaderPanel from "@/components/panel/HeaderPanel";
import CardRequest from "@/components/panel/cardRequest";

function PanelComponent() {
    const {
        isLoading,
        allFieldsComplete,
        userComplete,
        dataReady,
        toggleNewReq
    } = usePanel();

    // Show loading state while data is being fetched or processed
    if (isLoading || !dataReady || !userComplete) {
        return <LoadingPanel message={"Cargando información del usuario"} />;
    }

    // Only check for missing fields after data is fully loaded and ready
    if (dataReady && !allFieldsComplete) {
        return <MissingData />;
    }

    const hasLoans = userComplete.LoanApplication && userComplete.LoanApplication.length > 0;

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center flex-grow py-16 px-4">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 via-blue-100/20 to-transparent dark:from-green-900/10 dark:via-blue-900/10 rounded-full"></div>
                <Image
                    src={searchIlustration}
                    alt="No hay solicitudes"
                    fill
                    className="object-contain drop-shadow-sm opacity-70"
                    priority={true}
                />
            </div>

            <div className="text-center max-w-md">
                <h3 className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-3">
                    Sin solicitudes hasta el momento
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    Empieza creando tu primera solicitud de préstamo. Es rápido y sencillo.
                </p>

                <button
                    onClick={() => toggleNewReq(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Nueva solicitud</span>
                </button>
            </div>
        </div>
    );

    return (
        <main className="pt-20 min-h-screen bg-gray-50/50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <HeaderPanel />

                {!hasLoans ? (
                    <EmptyState />
                ) : (
                    <section
                        className="flex flex-col gap-4 mt-10"
                        role="region"
                        aria-label="Lista de solicitudes de préstamo"
                        data-tour="loans-section"
                    >
                        {userComplete.LoanApplication.map((loan) => (
                            <CardRequest
                                loan={loan}
                                key={loan.id}
                            />
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}

export default PanelComponent;