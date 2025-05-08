import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('creditoya_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: "No autorizado. Inicie sesión nuevamente." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const loanId = searchParams.get('loan_id');

        if (!loanId) {
            return NextResponse.json(
                { error: "ID de préstamo no proporcionado" },
                { status: 400 }
            );
        }

        // Validar el token del usuario
        try {
            await validateToken(token);
        } catch (error) {
            return NextResponse.json(
                { error: "Token inválido o expirado. Inicie sesión nuevamente." },
                { status: 401 }
            );
        }

        try {
            const { accept } = await req.json();

            if (accept === undefined || accept === null) {
                return NextResponse.json(
                    { error: "No has seleccionado una opción" },
                    { status: 400 }
                );
            }

            const baseURL = process.env.GATEWAY_API || '';

            const response = await axios.patch(
                `${baseURL}/loans/${loanId}/respond-cantity`,
                { accept },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Cookie: `creditoya-token=${token}`
                    }
                }
            );

            // Responder con los datos del préstamo actualizado
            return NextResponse.json(
                {
                    message: accept
                        ? "Has aceptado la nueva cantidad propuesta"
                        : "Has rechazado la nueva cantidad propuesta",
                    loan: response.data
                },
                { status: 200 }
            );

        } catch (error: any) {
            // Manejar errores específicos de la API
            if (error.response) {
                const status = error.response.status || 500;
                const message = error.response.data?.message || "Error al responder a la nueva cantidad";

                return NextResponse.json(
                    { error: message },
                    { status }
                );
            }

            // Error de conexión u otro error
            return NextResponse.json(
                { error: "Error de conexión con el servidor" },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Error al procesar la solicitud:", error);

        return NextResponse.json(
            { error: "Error al procesar la solicitud" },
            { status: 500 }
        );
    }
}