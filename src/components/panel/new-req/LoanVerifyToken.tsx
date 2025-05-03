"use client"

import useFormReq from "@/hooks/useNewReq";
import VerificationCodeInput from "./VerificationCodeInput";
import { CircleCheck } from "lucide-react";

function LoanVerifyToken({ PreLoanId }: { PreLoanId: string | null }) {
    const {
        handleCodeChange,
        sentToken,
        isSuccesVerifyToken,
    } = useFormReq();

    return (
        <div className="flex items-center justify-center mt-10">
            {!isSuccesVerifyToken && (
                <div className="rounded-lg p-6 text-center h-full max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Verificación de Identidad</h2>
                    <p className="text-gray-700 dark:text-gray-400 mb-4">
                        Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.
                    </p>

                    <div className="mb-6">
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                            Ingresa el código de verificación:
                        </label>
                        <VerificationCodeInput onChange={handleCodeChange} />
                        <p className="text-sm text-gray-500 mt-2">
                            El código expirará en 10 minutos
                        </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={sentToken}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Verificar
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm">
                            Reenviar código
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-6">
                        No Puedes crear otro prestamo hasta que verifiques o canceles esta solicitud.
                    </p>
                    <p className="text-xs mt-3 text-gray-400">{PreLoanId}</p>
                </div>
            )}

            {isSuccesVerifyToken && (
                <div className="rounded-lg p-6 text-center max-w-md w-full">
                    <div className="grid place-content-center">
                        <CircleCheck className="text-green-500" />
                    </div>
                    <p className="text-green-600 mb-4">
                        El token ha sido verificado exitosamente.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirigiendo a la página principal...
                    </p>
                </div>
            )}
        </div>
    )
}

export default LoanVerifyToken;