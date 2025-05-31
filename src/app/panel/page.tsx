"use client";

import usePanel from "@/hooks/usePanel";
import MissingData from "@/components/panel/MissingData";
import LoadingPanel from "@/components/panel/Loading";
import { Plus, Search, Filter, ArrowUpDown, Grid3X3, List } from "lucide-react";
import searchIlustration from "@/assets/ilustrations/Search.svg";
import Image from "next/image";
import HeaderPanel from "@/components/panel/HeaderPanel";
import CardRequest from "@/components/panel/cardRequest";
import { useState, useMemo } from "react";

function PanelComponent() {
    const {
        isLoading,
        allFieldsComplete,
        userComplete,
        dataReady,
        toggleNewReq
    } = usePanel();

    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Memoized filtered and sorted loans
    const filteredAndSortedLoans = useMemo(() => {
        if (!userComplete?.LoanApplication) return [];

        let filtered = userComplete.LoanApplication.filter(loan => {
            const matchesSearch = loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.cantity.toString().includes(searchTerm);

            const matchesStatus = filterStatus === 'all' || loan.status.toLowerCase() === filterStatus.toLowerCase();

            return matchesSearch && matchesStatus;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'amount':
                    comparison = Number(a.cantity) - Number(b.cantity);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [userComplete?.LoanApplication, searchTerm, sortBy, sortOrder, filterStatus]);

    // Get unique statuses for filter dropdown
    const availableStatuses = useMemo(() => {
        if (!userComplete?.LoanApplication) return [];
        const statuses = [...new Set(userComplete.LoanApplication.map(loan => loan.status))];
        return statuses;
    }, [userComplete?.LoanApplication]);

    // NOW we can do conditional rendering AFTER all hooks have been called
    // Show loading state while data is being fetched or processed
    if (isLoading || !dataReady || !userComplete) {
        return <LoadingPanel message={"Cargando información del usuario"} />;
    }

    // Only check for missing fields after data is fully loaded and ready
    if (dataReady && !allFieldsComplete) {
        return <MissingData />;
    }

    const hasLoans = userComplete.LoanApplication && userComplete.LoanApplication.length > 0;
    const hasFilteredResults = filteredAndSortedLoans.length > 0;

    const EmptyState = ({ isFiltered = false }: { isFiltered?: boolean }) => (
        <div className="flex flex-col items-center justify-center flex-grow py-16 px-4">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 via-blue-100/20 to-transparent dark:from-green-900/10 dark:via-blue-900/10 rounded-full"></div>
                <Image
                    src={searchIlustration}
                    alt={isFiltered ? "No se encontraron resultados" : "No hay solicitudes"}
                    fill
                    className="object-contain drop-shadow-sm opacity-70"
                    priority={true}
                />
            </div>

            <div className="text-center max-w-md">
                <h3 className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-3">
                    {isFiltered ? "No se encontraron solicitudes" : "Sin solicitudes hasta el momento"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    {isFiltered
                        ? "Intenta ajustar los filtros o realizar una nueva búsqueda para encontrar lo que buscas."
                        : "Empieza creando tu primera solicitud de préstamo. Es rápido y sencillo."
                    }
                </p>

                {!isFiltered && (
                    <button
                        onClick={() => toggleNewReq(false)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Nueva solicitud</span>
                    </button>
                )}

                {isFiltered && (
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setFilterStatus('all');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                        Limpiar filtros
                    </button>
                )}
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
                    <>
                        {/* Search and Filter Controls */}
                        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-1 max-w-md" data-tour="search-bar">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID, estado o monto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                {/* Filters and Controls */}
                                <div className="flex flex-wrap items-center gap-3" data-tour="filters">
                                    {/* Status Filter */}
                                    <div className="flex items-center gap-2">
                                        <Filter size={16} className="text-gray-400" />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="all">Todos los estados</option>
                                            {availableStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort Controls */}
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown size={16} className="text-gray-400" />
                                        <select
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                                                setSortBy(newSortBy);
                                                setSortOrder(newSortOrder);
                                            }}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="date-desc">Más reciente</option>
                                            <option value="date-asc">Más antiguo</option>
                                            <option value="amount-desc">Mayor monto</option>
                                            <option value="amount-asc">Menor monto</option>
                                            <option value="status-asc">Estado A-Z</option>
                                            <option value="status-desc">Estado Z-A</option>
                                        </select>
                                    </div>

                                    {/* View Mode Toggle */}
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1" data-tour="view-mode">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                                                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                }`}
                                            aria-label="Vista de lista"
                                        >
                                            <List size={16} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                                                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                }`}
                                            aria-label="Vista de cuadrícula"
                                        >
                                            <Grid3X3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results Summary */}
                            {searchTerm || filterStatus !== 'all' ? (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Mostrando {filteredAndSortedLoans.length} de {userComplete.LoanApplication.length} solicitudes
                                        {searchTerm && (
                                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                                "{searchTerm}"
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ) : null}
                        </section>

                        {/* Loans Grid/List */}
                        {hasFilteredResults ? (
                            <section
                                className={`
                                    ${viewMode === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                                        : 'flex flex-col gap-4'
                                    }
                                `}
                                role="region"
                                aria-label="Lista de solicitudes de préstamo"
                                data-tour="loans-section"
                            >
                                {filteredAndSortedLoans.map((loan) => (
                                    <CardRequest
                                        loan={loan}
                                        key={loan.id}
                                    />
                                ))}
                            </section>
                        ) : (
                            <EmptyState isFiltered={true} />
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default PanelComponent;