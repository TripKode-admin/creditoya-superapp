import { useClientAuth } from "@/context/AuthContext";
import { ILoanApplication, LoanStatus } from "@/types/full";
import axios from "axios";
import { useState, useEffect } from "react";

function useLoan({ loanId }: { loanId: string }) {
    const [loan, setLoan] = useState<ILoanApplication | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [respondingToCantity, setRespondingToCantity] = useState<boolean>(false);
    const [cantityResponse, setCantityResponse] = useState<{ success: boolean; message: string } | null>(null);

    const { user } = useClientAuth();

    useEffect(() => {
        getLoans();
    }, [loanId, user?.id]);

    const getLoans = async () => {
        // Omitir si el usuario aún no está cargado
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `/api/loan?loan_id=${loanId}&user_id=${user.id}`,
                { withCredentials: true },
            );

            // console.log("Respuesta del servidor:", res.data);

            if (res.data.success === false) throw new Error(res.data.error);

            // Extraer correctamente los datos del préstamo de la respuesta
            const loanData = res.data.data;
            setLoan(loanData);
        } catch (err: any) {
            setError(err.message || "Error al obtener préstamo");
            console.error("Error al obtener préstamo:", err);
        } finally {
            setLoading(false);
        }
    };

    // Mapa de colores de fondo según el estado
    const statusBgColors = {
        'Pendiente': 'bg-yellow-100',
        'Aprobado': 'bg-green-100',
        'Aplazado': 'bg-blue-100',
        'Borrador': 'bg-gray-100',
        'Archivado': 'bg-red-100',
    };

    // Obtener el color de fondo según el estado, con un valor predeterminado
    const bgColor = loan?.status
        ? statusBgColors[loan.status as LoanStatus] || 'bg-gray-100'
        : 'bg-gray-100';

    // Función para obtener el color del punto según el estado
    function getStatusDotColor(status: LoanStatus): string {
        const statusColors = {
            'Pendiente': 'text-yellow-500 fill-current',
            'Aprobado': 'text-green-500 fill-current',
            'Aplazado': 'text-blue-500 fill-current',
            'Borrador': 'text-gray-500 fill-current',
            'Archivado': 'text-red-500 fill-current',
        };

        return statusColors[status] || 'text-gray-400 fill-current';
    }

    // Función para responder a una propuesta de nueva cantidad
    async function respondToNewCantity(accept: boolean) {
        try {
            setRespondingToCantity(true);
            setCantityResponse(null);

            const response = await axios.post(
                `/api/loan/new-cantity?loan_id=${loanId}`,
                { accept },
                { withCredentials: true }
            );

            // console.log(response.data);

            // Siempre actualizar el estado después de una respuesta exitosa
            setTimeout(() => { window.location.reload(); }, 5000)

            setCantityResponse({
                success: true,
                message: response.data.message || (accept
                    ? "Has aceptado la nueva cantidad propuesta"
                    : "Has rechazado la nueva cantidad propuesta")
            });

            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error ||
                err.message ||
                "Error al responder a la propuesta de cantidad";

            setCantityResponse({
                success: false,
                message: errorMessage
            });

            console.error("Error al responder a la nueva cantidad:", err);
            return false;
        } finally {
            setRespondingToCantity(false);
        }
    }

    // Funciones específicas para aceptar o rechazar
    async function acceptNewCantity() {
        return await respondToNewCantity(true);
    }

    async function rejectNewCantity() {
        return await respondToNewCantity(false);
    }

    return {
        loan,
        loading,
        error,
        statusBgColors,
        getStatusDotColor,
        bgColor,
        respondingToCantity,
        cantityResponse,
        respondToNewCantity,
        acceptNewCantity,
        rejectNewCantity,
        refreshLoan: getLoans
    };
}

export default useLoan;