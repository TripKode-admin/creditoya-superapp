"use client"

import React from 'react';
import { 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    FileText, 
    DollarSign,
    Calendar,
    MessageSquare,
    Info
} from 'lucide-react';

// Tipos para los eventos
type TypeEventLoan = "CHANGE_CANTITY" | "DOCS_REJECT";

interface EventLoanApplication {
    id: string;
    type: TypeEventLoan;
    isAnswered?: boolean;
    created_at: string;
    LoanApplication?: {
        reasonChangeCantity?: string;
        docsReject?: string[];
    };
}

interface Loan {
    id: string;
    status: string;
    reasonReject?: string;
    EventLoanApplication?: EventLoanApplication[];
}

// Componente para mostrar los eventos de la solicitud
export const LoanEventsTimeline = ({ loan }: { loan: Loan }) => {
    console.log(loan);
    
    if (!loan.EventLoanApplication || loan.EventLoanApplication.length === 0) {
        return null;
    }

    // Ordenar eventos por fecha (más reciente primero)
    const sortedEvents = [...loan.EventLoanApplication].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const getEventIcon = (type: TypeEventLoan, isAnswered?: boolean) => {
        switch (type) {
            case 'CHANGE_CANTITY':
                return <DollarSign size={16} className="text-blue-600 dark:text-blue-400" />;
            case 'DOCS_REJECT':
                return <FileText size={16} className="text-red-500 dark:text-red-400" />;
            default:
                return <Clock size={16} className="text-gray-500 dark:text-gray-400" />;
        }
    };

    const getEventTitle = (type: TypeEventLoan) => {
        switch (type) {
            case 'CHANGE_CANTITY':
                return 'Cambio de Monto Solicitado';
            case 'DOCS_REJECT':
                return 'Documentos Rechazados';
            default:
                return 'Evento de Solicitud';
        }
    };

    const getEventColor = (type: TypeEventLoan, isAnswered?: boolean) => {
        if (isAnswered === false) {
            return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
        }
        
        switch (type) {
            case 'CHANGE_CANTITY':
                return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
            case 'DOCS_REJECT':
                return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
            default:
                return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
                        <Calendar className="text-white w-5 h-5 drop-shadow" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Historial de Eventos
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cronología de la solicitud de préstamo
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {sortedEvents.map((event, index) => (
                        <div 
                            key={event.id}
                            className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getEventColor(event.type, event.isAnswered)}`}
                        >
                            {/* Línea de conexión para timeline */}
                            {index < sortedEvents.length - 1 && (
                                <div className="absolute left-6 top-12 w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                                    {getEventIcon(event.type, event.isAnswered)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                            {getEventTitle(event.type)}
                                        </h4>
                                        {event.isAnswered === false && (
                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
                                                Pendiente
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Mostrar contenido específico según el tipo de evento */}
                                    {event.type === "CHANGE_CANTITY" && event.LoanApplication?.reasonChangeCantity && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            {event.LoanApplication.reasonChangeCantity}
                                        </p>
                                    )}
                                    
                                    {event.type === "DOCS_REJECT" && event.LoanApplication?.docsReject && (
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">
                                                Documentos que requieren atención:
                                            </p>
                                            <div className="space-y-1">
                                                {event.LoanApplication.docsReject.map((doc, docIndex) => (
                                                    <div key={docIndex} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                        <span>{doc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock size={12} />
                                        <span>
                                            {new Intl.DateTimeFormat('es-CO', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }).format(new Date(event.created_at))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Componente para mostrar las razones de rechazo cuando está en "Aplazado"
export const RejectReasonCard = ({ loan }: { loan: Loan }) => {
    // Solo mostrar si el estado es "Aplazado" y existe reasonReject
    if (loan.status !== 'Aplazado' || !loan.reasonReject) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-red-100 dark:border-red-800/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-red-100 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-md">
                        <AlertCircle className="text-white w-5 h-5 drop-shadow" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                            Solicitud Aplazada
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-300">
                            Lo sentimos tu solicitud fue aplazada
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Motivo del aplazamiento:
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                                {loan.reasonReject}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};