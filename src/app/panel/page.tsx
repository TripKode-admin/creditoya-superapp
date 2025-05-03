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

    // console.log(userComplete)

    // Show loading state while data is being fetched or processed
    if (isLoading || !dataReady || !userComplete) return <LoadingPanel message={"Cargando informacion del usuario"} />;

    // Only check for missing fields after data is fully loaded and ready
    if (dataReady && !allFieldsComplete) return <MissingData />;

    return (
        <main className="pt-26 min-h-dvh dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-3 px-4 flex flex-col">
                <HeaderPanel />
                {userComplete.LoanApplication && userComplete.LoanApplication.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-grow mt-12 mb-20">
                        <div className="relative w-64 h-64 opacity-65">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-800 opacity-20 rounded-full"></div>
                            <Image
                                src={searchIlustration}
                                alt="No hay solicitudes"
                                fill
                                className="object-contain drop-shadow-sm"
                                priority={true}
                            />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mt-6 font-medium">Sin ninguna solicitud hasta el momento</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 max-w-md text-center">
                            Empieza creando tu primera solicitud de préstamo usando el botón superior.
                        </p>
                        <button onClick={() => toggleNewReq(false)} className="dark:bg-gray-800 dark:hover:bg-gray-700 mt-8 flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm">
                            <Plus size={16} strokeWidth={2.5} />
                            <span className="font-medium">Nueva solicitud</span>
                        </button>
                    </div>
                )}

                {userComplete.LoanApplication && userComplete.LoanApplication.length > 0 && (
                    <div className="flex flex-col gap-3 mt-7">
                        {userComplete.LoanApplication.map((loan) => <CardRequest loan={loan} key={loan.id} />)}
                    </div>
                )}
            </div>
        </main>
    );
}

export default PanelComponent;