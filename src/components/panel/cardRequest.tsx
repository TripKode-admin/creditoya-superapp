"use client"

import { BankTypes, handleKeyToStringBank } from "@/handlers/stringToBank";
import { stringToPriceCOP } from "@/handlers/stringToCop";
import { eventLoanApplication, ILoanApplication, LoanStatus } from "@/types/full";
import { Bell, ChevronRight, Calendar, CreditCard, Building2, BellRing, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

function CardRequest({ loan }: { loan: ILoanApplication }) {
    const router = useRouter();
    const [hasNewEvents, setHasNewEvents] = useState(false);
    const [showNotificationPulse, setShowNotificationPulse] = useState(false);

    const redirectInfoLoan = () => router.push(`/panel/solicitud/${loan.id}`);

    // Función helper para convertir diferentes tipos de valores a booleano
    const isTruthy = (value: boolean | string | number): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        if (typeof value === 'number') {
            return value === 1;
        }
        return false;
    };

    // Memoized date formatting (more compact)
    const formattedDate = useMemo(() => {
        const date = new Date(loan.created_at);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, [loan.created_at]);

    // Check if loan is disbursed
    const isDisbursed = useMemo(() => {
        return isTruthy(loan.isDisbursed);
    }, [loan.isDisbursed]);

    // Memoized event count and new events detection
    const { unreadEventsCount, hasRecentEvents } = useMemo(() => {
        const unreadEvents = loan.EventLoanApplication?.filter(
            (event) => event.isAnswered === false
        ) || [];

        const unreadCount = unreadEvents.length;

        // Check if there are events created in the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentEvents = unreadEvents.some(event =>
            new Date(event.created_at) > oneDayAgo
        );

        return {
            unreadEventsCount: unreadCount,
            hasRecentEvents: recentEvents && unreadCount > 0
        };
    }, [loan.EventLoanApplication]);

    // Effect to handle new events notification
    useEffect(() => {
        if (hasRecentEvents) {
            setHasNewEvents(true);
            setShowNotificationPulse(true);

            // Auto-hide the pulse animation after 3 seconds
            const timer = setTimeout(() => {
                setShowNotificationPulse(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [hasRecentEvents]);

    // Memoized masked account number (last 4 digits only)
    const maskedAccountNumber = useMemo(() => {
        const accountNumber = loan.bankNumberAccount;
        return `****${accountNumber.slice(-4)}`;
    }, [loan.bankNumberAccount]);

    // Status color mapping with proper styling for each status
    const getStatusStyles = (status: LoanStatus) => {
        switch (status) {
            case LoanStatus.APPROVED:
                return {
                    textColor: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800'
                };
            case LoanStatus.POSTPONED:
                return {
                    textColor: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800'
                };
            case LoanStatus.PENDING:
                return {
                    textColor: 'text-gray-600 dark:text-gray-400',
                    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
                    borderColor: 'border-gray-200 dark:border-gray-800'
                };
            case LoanStatus.DRAFT:
                return {
                    textColor: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    borderColor: 'border-yellow-200 dark:border-yellow-800'
                };
            case LoanStatus.ARCHIVED:
                return {
                    textColor: 'text-purple-600 dark:text-purple-400',
                    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                    borderColor: 'border-purple-200 dark:border-purple-800'
                };
            default:
                return {
                    textColor: 'text-gray-600 dark:text-gray-400',
                    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
                    borderColor: 'border-gray-200 dark:border-gray-800'
                };
        }
    };

    const handleNotificationClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHasNewEvents(false);
        setShowNotificationPulse(false);
        console.log('Notification clicked for loan:', loan.id);
        // Aquí puedes agregar lógica adicional como marcar eventos como leídos
        redirectInfoLoan();
    };

    // Get notification icon based on state
    const getNotificationIcon = () => {
        if (hasRecentEvents || showNotificationPulse) {
            return <BellRing size={16} className="animate-bounce" />;
        }
        return <Bell size={16} />;
    };

    const statusStyles = getStatusStyles(loan.status);

    return (
        <article
            onClick={redirectInfoLoan}
            className={`
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                cursor-pointer transition-all duration-200
                hover:bg-gray-50 dark:hover:bg-gray-750
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                ${hasNewEvents ? 'ring-2 ring-orange-200 dark:ring-orange-800 shadow-lg' : ''}
                ${isDisbursed ? 'ring-2 ring-green-200 dark:ring-green-800 shadow-md' : ''}
            `}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de la solicitud de préstamo por ${stringToPriceCOP(loan.cantity)}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    redirectInfoLoan();
                }
            }}
        >
            <div className="p-3 sm:p-4">
                {/* Disbursement Alert Banner */}
                {isDisbursed && (
                    <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                Préstamo desembolsado
                            </span>
                        </div>
                    </div>
                )}

                {/* New Events Alert Banner */}
                {hasNewEvents && (
                    <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                        <div className="flex items-center gap-2">
                            <BellRing size={14} className="text-orange-600 dark:text-orange-400 animate-pulse flex-shrink-0" />
                            <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                                Nuevos eventos en esta solicitud
                            </span>
                        </div>
                    </div>
                )}

                {/* Header Section - Reorganized for mobile */}
                <div className="mb-3">
                    {/* Top row: Status badge and notification/arrow */}
                    <div className="flex items-center justify-between mb-2">
                        <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${statusStyles.textColor} ${statusStyles.bgColor} ${statusStyles.borderColor}
                        `}>
                            {loan.status}
                        </span>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Disbursement Icon */}
                            {isDisbursed && (
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <CheckCircle2
                                        size={16}
                                        className="text-green-600 dark:text-green-400"
                                    />
                                </div>
                            )}

                            {/* Notification Bell */}
                            {unreadEventsCount > 0 && (
                                <button
                                    onClick={handleNotificationClick}
                                    className={`
                                        relative p-1.5 transition-all duration-200 rounded-full
                                        ${hasRecentEvents
                                            ? 'text-orange-600 hover:text-orange-700 bg-orange-100 dark:bg-orange-900/30'
                                            : 'text-orange-500 hover:text-orange-600'
                                        }
                                        ${showNotificationPulse ? 'animate-pulse' : ''}
                                    `}
                                    aria-label={`${unreadEventsCount} notificaciones sin leer`}
                                >
                                    {getNotificationIcon()}
                                    <span className={`
                                        absolute -top-1 -right-1 w-4 h-4 text-white text-xs rounded-full 
                                        flex items-center justify-center font-medium
                                        ${hasRecentEvents
                                            ? 'bg-red-600 animate-pulse shadow-lg'
                                            : 'bg-red-500'
                                        }
                                    `}>
                                        {unreadEventsCount > 9 ? '9+' : unreadEventsCount}
                                    </span>

                                    {/* Pulse ring for new events */}
                                    {showNotificationPulse && (
                                        <span className="absolute inset-0 rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                                    )}
                                </button>
                            )}

                            {/* Arrow */}
                            <ChevronRight
                                size={16}
                                className="text-gray-400 dark:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Amount and Disbursement badge row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 break-words">
                            {stringToPriceCOP(loan.cantity)}
                        </h3>

                        {/* Disbursement Badge - Only show on mobile when amount is on separate line */}
                        {isDisbursed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 w-fit">
                                <CheckCircle2 size={10} />
                                Desembolsado
                            </span>
                        )}
                    </div>
                </div>

                {/* Info Row - Improved mobile layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Bank */}
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-20 sm:max-w-24">
                                {handleKeyToStringBank(loan.entity as BankTypes)}
                            </span>
                        </div>

                        {/* Account */}
                        <div className="flex items-center gap-1.5">
                            <CreditCard size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="font-mono text-xs">
                                {maskedAccountNumber}
                            </span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {/* Event Summary */}
                {unreadEventsCount > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {unreadEventsCount === 1 ? '1 evento pendiente' : `${unreadEventsCount} eventos pendientes`}
                            </span>
                            {hasRecentEvents && (
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    ¡Nuevo!
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

export default CardRequest;