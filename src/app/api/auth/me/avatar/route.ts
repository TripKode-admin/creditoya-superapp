import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;
    
    console.log('[UPLOAD] Token present:', !!token);
    
    await validateToken(token);
    
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('user_id') as string;
        
        console.log('[UPLOAD] Archivo presente:', !!file);
        if (!file) {
            console.warn('[UPLOAD] No se proporcionó ningún archivo');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            }, { status: 400 });
        }
        
        const baseURL = process.env.GATEWAY_API || '';
        console.log('[UPLOAD] Using API URL:', baseURL);
        
        // Create the form data for the API request
        const apiFormData = new FormData();
        apiFormData.append('file', file);
        
        // Configure the request headers
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type for FormData
            },
            withCredentials: true
        };
        
        console.log('[UPLOAD] Making request to API with token:', !!token);
        
        try {
            // Make the request to the backend API
            const responseDB = await axios.put(
                `${baseURL}/clients/${userId}/avatar`,
                apiFormData,
                config
            );
            
            console.log('[UPLOAD] API response:', responseDB.status, responseDB.statusText);
            console.log('[UPLOAD] API response data:', responseDB.data);
            
            return NextResponse.json({
                success: true,
                data: "Actualizacion de avatar exitoso",
            });
        } catch (apiError: any) {
            console.error('[UPLOAD] API request error details:', {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                message: apiError.message
            });
            
            throw apiError; // Re-throw to be caught by the outer try-catch
        }
    } catch (error: any) {
        console.error('[UPLOAD] Error en petición de subida de imagen:', error);
        
        if (error.response?.status === 401) {
            return NextResponse.json({
                success: false,
                error: 'No autenticado'
            }, { status: 401 });
        }
        
        return NextResponse.json({
            success: false,
            error: error.response?.data?.error || error.message || 'Error desconocido al subir la imagen'
        }, { status: error.response?.status || 500 });
    }
}