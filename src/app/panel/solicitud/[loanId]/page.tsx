"use client"

import LoadingPanel from "@/components/panel/Loading";
import useLoan from "@/hooks/useLoan";
import { use } from "react";
import DotBox from "@/components/panel/perfil/DotBox";
import {
    CircleDollarSign,
    WalletMinimal,
    CircleUser,
    Smartphone,
    Mail,
    MapPin,
    Earth,
    Building2,
    CalendarClock,
    ArrowLeft,
    User,
    Copy,
    ExternalLink
} from "lucide-react";
import { stringToPriceCOP } from "@/handlers/stringToCop";
import { BankTypes, handleKeyToStringBank } from "@/handlers/stringToBank";
import Image from "next/image";
import DocumentsRequired from "@/components/panel/solicitud/DocumentRequired";
import { useRouter } from "next/navigation";
import CardChangeCantity from "@/components/panel/solicitud/CardChangeCantity";
import CardDocsReject from "@/components/panel/solicitud/CardDocsReject";
import { LoanEventsTimeline, RejectReasonCard } from "@/components/panel/solicitud/EventsPreview";

function LoanInfoPage({ params }: { params: Promise<{ loanId: string }> }) {
    const resolveParams = use(params);
    const { loanId } = resolveParams;
    const {
        loan,
        loading,
        error,
    } = useLoan({ loanId });

    const router = useRouter()

    // Formatear el nombre de la empresa para mostrar
    const formatCompanyName = (company: string): string => {
        return company.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Función para copiar al portapapeles
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Si está cargando, mostrar un indicador de carga
    if (loading) return <LoadingPanel message="Cargando datos de la solicitud de prestamo" />

    // Si hay un error, mostrar el mensaje de error
    if (error) {
        return (
            <main className="pt-26 min-h-dvh dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center min-h-[200px]">
                    <div className="p-6 border border-red-200 rounded-xl bg-red-50 text-red-700 backdrop-blur-sm">
                        <p className="font-semibold text-lg">Error al cargar el préstamo</p>
                        <p className="text-sm mt-2 opacity-80">{error}</p>
                    </div>
                </div>
            </main>
        )
    }

    // Si no hay préstamo aún después de cargar, mostrar mensaje
    if (!loan) {
        return (
            <main className="pt-26 min-h-dvh dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center min-h-[200px]">
                    <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 backdrop-blur-sm">
                        <p className="text-gray-700 font-medium">No se encontró información del préstamo solicitado.</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-dvh dark:bg-gray-900 py-8 px-4 pt-24">

            {/* Enhanced Back Navigation */}
            <div className="max-w-7xl mx-auto mb-12 mt-5">
                <div
                    className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push('/panel')}
                >
                    <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                    </div>
                    <span className="font-medium">Todos los préstamos</span>
                </div>
            </div>

            {/* Enhanced Hero Section - Loan Amount */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 border border-green-100 dark:border-green-800/50 shadow-lg backdrop-blur-sm">
                    <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-2.5 rounded-xl shadow-lg flex-shrink-0">
                                <CircleDollarSign className="text-white drop-shadow-sm" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-600 dark:text-gray-300 text-xs font-medium mb-1">
                                    Monto Solicitado
                                </p>
                                {loan.newCantity ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <h1 className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-500 line-through">
                                            {stringToPriceCOP(loan.cantity)}
                                        </h1>
                                        <div className="hidden sm:block">
                                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {stringToPriceCOP(loan.newCantity)}
                                        </h1>
                                    </div>
                                ) : (
                                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        {stringToPriceCOP(loan.cantity)}
                                    </h1>
                                )}
                                {loan.newCantityOpt && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                        {loan.newCantityOpt}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <DotBox status={loan.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Cards with Enhanced Styling */}
            {loan.EventLoanApplication && loan.EventLoanApplication.length !== 0 && loan.EventLoanApplication.map(events => (
                events.type == "CHANGE_CANTITY" && events.isAnswered == false &&
                <div key={events.id} className="max-w-7xl mx-auto mb-8">
                    <CardChangeCantity loan={loan} />
                </div>
            ))}

            {loan.EventLoanApplication && loan.EventLoanApplication.length !== 0 && loan.EventLoanApplication.map(events => (
                events.type == "DOCS_REJECT" && events.isAnswered == false &&
                <div key={events.id} className="max-w-7xl mx-auto mb-8">
                    <CardDocsReject loan={loan} />
                </div>
            ))}

            {/* Enhanced Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Enhanced Cards */}
                <div className="lg:col-span-2 space-y-8">

                    <RejectReasonCard loan={{
                        ...loan,
                        EventLoanApplication: loan.EventLoanApplication?.map(event => ({
                            ...event,
                            created_at: typeof event.created_at === "string"
                                ? event.created_at
                                : event.created_at?.toISOString?.() ?? event.created_at
                        }))
                    }} />

                    <LoanEventsTimeline loan={{
                        ...loan,
                        EventLoanApplication: loan.EventLoanApplication?.map(event => ({
                            ...event,
                            created_at: typeof event.created_at === "string"
                                ? event.created_at
                                : event.created_at?.toISOString?.() ?? event.created_at
                        }))
                    }} />

                    {/* Enhanced Financial Information Card */}
                    <div className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-300 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center mb-8">
                                <div className="mr-4 bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-md">
                                    <WalletMinimal className="text-white w-5 h-5 drop-shadow" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg text-green-700 dark:text-green-400">Información Financiera</p>
                                    <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">Datos donde será depositado el dinero de tu préstamo</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-3">Entidad Bancaria</p>
                                    <p className="font-medium text-xl dark:text-gray-100">{handleKeyToStringBank(loan.entity as BankTypes)}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-3">Número de Cuenta</p>
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium text-xl dark:text-gray-100">{loan.bankNumberAccount}</p>
                                        <button
                                            onClick={() => copyToClipboard(loan.bankNumberAccount)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                        >
                                            <Copy size={16} className="text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-3">Tipo de Cuenta</p>
                                    <p className="font-medium text-xl dark:text-gray-100">Ahorros</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-3">ID de Solicitud</p>
                                    <div className="flex items-center gap-3">
                                        <p className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">{loan.id}</p>
                                        <button
                                            onClick={() => copyToClipboard(loan.id)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                        >
                                            <Copy size={16} className="text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Documents Section */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                        <DocumentsRequired loan={loan} />
                    </div>
                </div>

                {/* Right Column - Enhanced Personal Info */}
                <div className="space-y-8">

                    {/* Enhanced Personal Information Card */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center mb-8">
                                <div className="mr-4 bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-md">
                                    <CircleUser className="text-white w-5 h-5 drop-shadow" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg text-green-700 dark:text-green-400">Información Personal</p>
                                    <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">Datos del solicitante</p>
                                </div>
                            </div>

                            <div className="space-y-8">

                                {/* Enhanced User Profile */}
                                <div>
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-4">Nombre Completo</p>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        {loan.user.avatar && loan.user.avatar !== "No definido" ? (
                                            <Image
                                                src={loan.user.avatar}
                                                alt={"Avatar de " + loan.user.names}
                                                width={44}
                                                height={44}
                                                className="rounded-full shadow-lg object-cover aspect-square ring-2 ring-green-200 dark:ring-green-800"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg ring-2 ring-green-200 dark:ring-green-800">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                                                {loan.user.names} {loan.user.firstLastName} {loan.user.secondLastName}
                                            </p>
                                            <button
                                                onClick={() => router.push('/panel/perfil')}
                                                className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200 mt-1"
                                            >
                                                Ir al perfil
                                                <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Contact Section */}
                                <div>
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-4">Contacto</p>
                                    <div className="space-y-6">

                                        {/* Phone Numbers */}
                                        <div>
                                            <p className="text-gray-500 text-sm mb-3 font-medium">Números de contacto</p>
                                            <div className="space-y-2">
                                                {(() => {
                                                    try {
                                                        const phones = JSON.parse(loan.phone);
                                                        if (Array.isArray(phones) && phones.length > 0) {
                                                            return phones.map((phone, index) => (
                                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                                        <Smartphone className="text-green-600 dark:text-green-400" size={16} />
                                                                    </div>
                                                                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                                        {phone}
                                                                    </p>
                                                                </div>
                                                            ));
                                                        }
                                                        return <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay teléfonos registrados</p>;
                                                    } catch (error) {
                                                        return <p className="text-sm text-red-500 dark:text-red-400">Error al cargar teléfonos</p>;
                                                    }
                                                })()}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <p className="text-gray-500 text-sm mb-3 font-medium">Correo Electrónico</p>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                    <Mail className="text-green-600 dark:text-green-400" size={16} />
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 font-medium">{loan.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Location Section */}
                                <div>
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-4">Ubicación</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                <Earth className="text-green-600 dark:text-green-400" size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ciudad</p>
                                                <p className="text-gray-700 dark:text-gray-300 font-medium">{loan.city}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                <MapPin className="text-green-600 dark:text-green-400" size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dirección de residencia</p>
                                                <p className="text-gray-700 dark:text-gray-300 font-medium">{loan.residence_address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Company Section */}
                                <div>
                                    <p className="text-green-600 dark:text-green-500 text-sm font-semibold mb-4">Empresa Actual</p>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                            <Building2 className="text-green-600 dark:text-green-400" size={16} />
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 font-medium">{formatCompanyName(loan.user.currentCompanie)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Application Status Card */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                                    <CalendarClock size={16} className="text-white" />
                                </div>
                                <h3 className="text-lg dark:text-gray-200 font-semibold">Fecha de Solicitud</h3>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {new Intl.DateTimeFormat('es-CO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }).format(new Date(loan.created_at))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default LoanInfoPage