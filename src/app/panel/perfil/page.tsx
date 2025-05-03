"use client"

import { useState, useEffect } from "react";
import LoadingPanel from "@/components/panel/Loading";
import usePanel from "@/hooks/usePanel";
import SelectEmpresa from "@/components/panel/selectCompani";
import VerificationPerfil from "@/components/panel/perfil/Verification";
import FormDatesPerfil from "@/components/panel/perfil/InputsGroup";
import PerfilAvatar from "@/components/panel/perfil/avatar";
import LatestLoan from "@/components/panel/perfil/Latestsloans";

function PanelPerfilUser() {
    const {
        userComplete,
        isLoading,
        isPending,
        dataReady
    } = usePanel();
    const [isPageReady, setIsPageReady] = useState(false);

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

    // Show loading state if data is not ready
    if (!isPageReady) {
        return <LoadingPanel message={"Cargando datos del perfil"} />;
    }

    return (
        <main className="min-h-dvh dark:bg-gray-900 pt-32 pb-20">
            <div className="max-w-7xl mx-auto py-3 px-4 flex flex-wrap gap-6 sm:gap-20">
                <div className="basis-[400px] grow space-y-4">
                    <PerfilAvatar />
                    <FormDatesPerfil />
                </div>

                <div className="basis-[400px] grow space-y-3">
                    <VerificationPerfil />
                    <SelectEmpresa />
                    <LatestLoan />
                </div>
            </div>
            {/* <div className="max-w-7xl mx-auto py-3 px-4 flex flex-wrap gap-6 sm:gap-20">
                <div>

                </div>
            </div> */}
        </main>
    );
}

export default PanelPerfilUser;