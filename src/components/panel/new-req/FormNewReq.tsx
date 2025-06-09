"use client"

import DefaultInput from "./defaultInput";
import SelectBanks from "./SelectBank";
import SignaturePad from "./SignaturePad";
import LoadingPanel from "../Loading";
import BoxUploadFiles from "./BoxUploadFile";
import useFormReq from "@/hooks/useNewReq";
import LoanVerifyToken from "./LoanVerifyToken";
import { useClientAuth } from "@/context/AuthContext";
import {
    CreditCard,
    MapPin,
    User,
    Mail,
    Hash,
    DollarSign,
    MapPinHouse,
    Fingerprint,
    Shield,
    ArrowRight,
    Upload,
    Phone
} from "lucide-react";
import PhoneList from "./PhoneList";

function FormNewReq() {
    const {
        userComplete,
        isCheckingStorage,
        isCreating,
        IsSuccessPreCreate,
        PreLoanId,
        formData,
        acceptedTerms,
        handleBankAccountChange,
        handleBankSelect,
        handleSubmit,
        handleCantityChange,
        handleSignature,
        handleFileUpload,
        handleTermsChange,
        addPhoneNumber,
        removePhoneNumber,
        editPhoneNumber,
        handleFieldChange
    } = useFormReq();

    const { user } = useClientAuth()

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
            <div className="min-h-screen w-full mt-10">
                <div className="w-full max-w-none mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                        {/* Sección: Datos Personales */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-blue-100 dark:border-blue-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Datos Personales</h3>
                                        <p className="text-xs sm:text-base text-blue-600 dark:text-blue-400 font-medium line-clamp-1">Información básica para verificar tu identidad</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <DefaultInput
                                        title={"Nombre"}
                                        value={user?.names}
                                        icon={Fingerprint}
                                    />
                                    <DefaultInput
                                        title={"Primer apellido"}
                                        value={user?.firstLastName}
                                        icon={Fingerprint}
                                    />
                                </div>

                                <DefaultInput
                                    title={"Segundo apellido"}
                                    value={user?.secondLastName}
                                    icon={Fingerprint}
                                />
                            </div>
                        </div>

                        {/* Sección: Información de Contacto */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-green-100 dark:border-green-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Información de Contacto</h3>
                                        <p className="text-sm sm:text-base text-green-600 dark:text-green-400 font-medium line-clamp-1">Datos de ubicación y medios de comunicación</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <PhoneList
                                    phones={formData.phone}
                                    onAddPhone={addPhoneNumber}
                                    onRemovePhone={removePhoneNumber}
                                    onEditPhone={editPhoneNumber}
                                    required
                                />

                                <DefaultInput
                                    title={"Correo electrónico"}
                                    value={user?.email}
                                    required
                                    icon={Mail}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <DefaultInput
                                        title={"Ciudad"}
                                        value={formData.city}
                                        required
                                        onChange={(value) => handleFieldChange('city', value)}
                                        icon={MapPin}
                                    />

                                    <DefaultInput
                                        title={"Dirección de residencia"}
                                        value={formData.residence_address}
                                        onChange={(value) => handleFieldChange('residence_address', value)}
                                        required
                                        icon={MapPinHouse}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Información Financiera */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-100 dark:border-emerald-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Información Financiera</h3>
                                        <p className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-medium line-clamp-1">Entidad bancaria, cuenta de desembolso y monto solicitado</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <SelectBanks select={handleBankSelect} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <DefaultInput
                                        title={"Número de cuenta"}
                                        onChange={handleBankAccountChange}
                                        value={formData.bankNumberAccount}
                                        required
                                        icon={Hash}
                                    />

                                    <DefaultInput
                                        title={"Monto solicitado"}
                                        isValue={true}
                                        onChange={handleCantityChange}
                                        value={formData.cantity}
                                        required
                                        placeholder="0"
                                        icon={DollarSign}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Documentos Requeridos */}
                        {userComplete && userComplete.currentCompanie !== "valor_agregado" && (
                            <div className="bg-white dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-orange-100 dark:border-orange-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Documentos Requeridos</h3>
                                            <p className="text-sm sm:text-base text-orange-600 dark:text-orange-400 font-medium line-clamp-1 sm:line-clamp-2">Carga los volantes de pago y carta laboral para validar tus ingresos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                            </div>
                        )}

                        {/* Sección: Firma Digital */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-purple-100 dark:border-purple-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Firma Digital</h3>
                                        <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-medium line-clamp-1">Firma para validar tu solicitud de préstamo</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <SignaturePad onSave={handleSignature} required />
                            </div>
                        </div>

                        {/* Sección: Términos y Condiciones + Submit */}
                        <div className=" dark:border-gray-700/50 backdrop-blur-sm">
                            <div className="">
                                {/* Términos y Condiciones */}
                                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-600/50 mb-6 sm:mb-8">
                                    <div className="flex items-center shrink-0 mt-0.5">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptedTerms}
                                            onChange={handleTermsChange}
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <label htmlFor="terms" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium block">
                                            Acepto los{" "}
                                            <a
                                                href="https://tusitio.com/terminos"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline decoration-2 underline-offset-2 transition-colors duration-200"
                                            >
                                                Términos y Condiciones
                                            </a>
                                        </label>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                            Al marcar esta casilla, confirmas que has leído y aceptas nuestros términos de servicio y política de privacidad.
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!acceptedTerms}
                                    className={`
                                        group relative w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform 
                                        ${acceptedTerms
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <span>Enviar Solicitud</span>
                                        {acceptedTerms && (
                                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                                        )}
                                    </div>

                                    {acceptedTerms && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    )}
                                </button>

                                {!acceptedTerms && (
                                    <div className="flex items-center gap-2 justify-center mt-4 text-amber-600 dark:text-amber-400">
                                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        <p className="text-xs sm:text-sm font-medium text-center">Debes aceptar los términos y condiciones para continuar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default FormNewReq;