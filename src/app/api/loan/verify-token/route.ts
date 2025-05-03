import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    await validateToken(token);

    try {
        const { preToken, preLoanId, userId } = await req.json();

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        try {
            const baseURL = process.env.GATEWAY_API || '';

            // Make the request to the backend API - note userId is now in the URL path
            const loanResponse = await axios.post(
                `${baseURL}/loans/${userId}/${preLoanId}`,
                { token: preToken, preLoanId },
                config
            );

            const loanDetails = loanResponse.data;

            if (loanDetails.error) {
                return NextResponse.json({
                    success: false,
                    error: loanDetails.error
                }, { status: 400 });
            }

            return NextResponse.json({
                success: true,
                data: "Token verificado exitosamente",
                loanDetails
            }, { status: 200 });
        } catch (error) {
            console.error("Error al verificar el token:", error);
            return NextResponse.json({
                success: false,
                error: 'Error al verificar el token'
            }, { status: 500 });

        }

    } catch (error) {
        console.error('[UPLOAD] Error al procesar la solicitud:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 500 });
    }
}