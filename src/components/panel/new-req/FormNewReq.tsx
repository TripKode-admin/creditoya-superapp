"use client"

import DefaultInput from "./defaultInput";
import SelectBanks from "./SelectBank";
import SignaturePad from "./SignaturePad";
import LoadingPanel from "../Loading";
import BoxUploadFiles from "./BoxUploadFile";
import useFormReq from "@/hooks/useNewReq";
import LoanVerifyToken from "./LoanVerifyToken";

function FormNewReq() {
    const {
        userComplete,
        isCheckingStorage,
        isCreating,
        IsSuccessPreCreate,
        PreLoanId,
        formData,
        handleBankAccountChange,
        handleBankSelect,
        handleSubmit,
        handleCantityChange,
        handleSignature,
        handleFileUpload,
        acceptedTerms,
        handleTermsChange
    } = useFormReq();

    if (!userComplete || isCheckingStorage === true) {
        return <LoadingPanel message={"Cargando Formulario"} />;
    }

    if (isCreating === true && IsSuccessPreCreate === false) {
        return <LoadingPanel message={"Ya casi esta listo, espera un momento"} />;
    }

    if (isCreating === false && IsSuccessPreCreate === true) {
        return <LoanVerifyToken PreLoanId={PreLoanId} />
    }

    if (isCreating === false && IsSuccessPreCreate === false) {
        return (
            <form onSubmit={handleSubmit}>
                <div className="mt-8 space-y-4">
                    <SelectBanks select={handleBankSelect} />
                    <DefaultInput
                        title={"Numero de cuenta"}
                        onChange={handleBankAccountChange}
                        value={formData.bankNumberAccount}
                        required
                    />
                    <DefaultInput
                        title={"Monto"}
                        isValue={true}
                        onChange={handleCantityChange}
                        value={formData.cantity}
                        required
                        placeholder="0"
                    />
                    <SignaturePad onSave={handleSignature} required />

                    {userComplete && userComplete.currentCompanie !== "valor_agregado" && (
                        <div>
                            <label className="text-lg font-medium dark:text-gray-300 text-gray-700 mb-2">
                                Soportes de Ingresos Laborales
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                <BoxUploadFiles
                                    title={"Primer Volante de Pago"}
                                    onChange={(file) => handleFileUpload('fisrt_flyer', file)}
                                    required
                                />
                                <BoxUploadFiles
                                    title={"Segundo Volante de Pago"}
                                    onChange={(file) => handleFileUpload('second_flyer', file)}
                                    required
                                />
                                <BoxUploadFiles
                                    title={"Tercer Volante de Pago"}
                                    onChange={(file) => handleFileUpload('third_flyer', file)}
                                    required
                                />
                                <BoxUploadFiles
                                    title={"Carta laboral actualizada"}
                                    onChange={(file) => handleFileUpload('labor_card', file)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Términos y Condiciones */}
                    <div className="grid place-content-center mt-10">
                        <div className="flex items-start gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={handleTermsChange}
                                className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                Acepto los{" "}
                                <a
                                    href="https://tusitio.com/terminos"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Términos y Condiciones
                                </a>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!acceptedTerms}
                        className={`w-full px-4 py-2 rounded-xl transition-all text-white ${acceptedTerms
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                            } mb-10`}
                    >
                        Continuar
                    </button>
                </div>
            </form>
        );
    }
}

export default FormNewReq;