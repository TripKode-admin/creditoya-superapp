import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    if (!token) {
        return NextResponse.json(
            { message: 'No estás autenticado' },
            { status: 401 }
        );
    }

    try {
        await validateToken(token);

        // Since we're using FormData, we need to parse it correctly
        const formData = await request.formData();

        // Extract file uploads
        const labor_card = formData.get('labor_card') as File | null;
        const fisrt_flyer = formData.get('fisrt_flyer') as File | null;
        const second_flyer = formData.get('second_flyer') as File | null;
        const third_flyer = formData.get('third_flyer') as File | null;

        // Extract loan ID and document type
        const loanId = formData.get('loanId') as string;

        if (!loanId) {
            return NextResponse.json(
                { message: 'El ID del préstamo es requerido' },
                { status: 400 }
            );
        }

        const baseURL = process.env.GATEWAY_API || '';

        // Track which document types were uploaded
        const uploadedDocuments = [];

        // Process each document type if provided
        if (labor_card) {
            const response = await uploadDocument(
                baseURL,
                loanId,
                'labor_card',
                labor_card,
                token
            );
            uploadedDocuments.push({ type: 'labor_card', response });
        }

        if (fisrt_flyer) {
            const response = await uploadDocument(
                baseURL,
                loanId,
                'fisrt_flyer',
                fisrt_flyer,
                token
            );
            uploadedDocuments.push({ type: 'fisrt_flyer', response });
        }

        if (second_flyer) {
            const response = await uploadDocument(
                baseURL,
                loanId,
                'second_flyer',
                second_flyer,
                token
            );
            uploadedDocuments.push({ type: 'second_flyer', response });
        }

        if (third_flyer) {
            const response = await uploadDocument(
                baseURL,
                loanId,
                'third_flyer',
                third_flyer,
                token
            );
            uploadedDocuments.push({ type: 'third_flyer', response });
        }

        // If no documents were uploaded
        if (uploadedDocuments.length === 0) {
            return NextResponse.json(
                { message: 'No se proporcionaron documentos para subir' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Documentos actualizados correctamente',
            uploads: uploadedDocuments
        });

    } catch (error: any) {
        console.error('Error al subir documentos:', error);

        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || 'Error al comunicarse con el servidor';

            return NextResponse.json(
                { message },
                { status }
            );
        }

        return NextResponse.json(
            { message: error.message || 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

// Helper function to upload a single document
async function uploadDocument(
    baseURL: string,
    loanId: string,
    documentType: string,
    file: File,
    token: string
) {
    // Create a new FormData object for each request
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
        `${baseURL}/loans/${loanId}/upload-rejected-document/${documentType}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    );

    return response.data;
}