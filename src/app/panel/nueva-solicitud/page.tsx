"use client"

import HeaderPanel from "@/components/panel/HeaderPanel"
import LoadingPanel from "@/components/panel/Loading";
import FormNewReq from "@/components/panel/new-req/FormNewReq"
import usePanel from "@/hooks/usePanel";

function NewReqPage() {

    const {
        isLoading,
        dataReady,
    } = usePanel()

    // Show loading state while data is being fetched or processed
    if (isLoading || !dataReady) return <LoadingPanel message={"Cargando"} />;

    return (
        <>
            <main className="pt-20 dark:bg-gray-900 min-h-dvh">
                <div className="max-w-7xl mx-auto py-3 px-4">
                    <HeaderPanel isReq={true} />
                    <FormNewReq />
                </div>
            </main>
        </>
    )
}

export default NewReqPage