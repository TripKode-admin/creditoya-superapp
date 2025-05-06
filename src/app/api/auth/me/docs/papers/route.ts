import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // Mejorar logging para debugging
    console.log('[UPLOAD] Iniciando proceso de subida');

    // Obtener y validar token
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    if (!token) {
        console.warn('[UPLOAD] No se encontró token de autenticación');
        return NextResponse.json({
            success: false,
            error: 'No autenticado'
        }, { status: 401 });
    }

    try {
        await validateToken(token);
    } catch (tokenError) {
        console.error('[UPLOAD] Error validando token:', tokenError);
        return NextResponse.json({
            success: false,
            error: 'Token inválido'
        }, { status: 401 });
    }

    try {
        // Extraer y validar los datos del formulario
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('user_id') as string;

        // Mejorar validación y logging
        console.log('[UPLOAD] Datos recibidos:', {
            filePresente: !!file,
            fileType: file?.type,
            fileSize: file?.size,
            userId: userId
        });

        if (!file) {
            console.warn('[UPLOAD] No se proporcionó ningún archivo');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            }, { status: 400 });
        }

        if (!userId) {
            console.warn('[UPLOAD] No se proporcionó ningún identificador de usuario');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún identificador'
            }, { status: 401 });
        }

        // Validar el tamaño del archivo (límite de 10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            console.warn(`[UPLOAD] Archivo demasiado grande: ${file.size} bytes`);
            return NextResponse.json({
                success: false,
                error: 'El archivo es demasiado grande. El tamaño máximo es 10MB.'
            }, { status: 400 });
        }

        // Validar el tipo de archivo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            console.warn(`[UPLOAD] Tipo de archivo no válido: ${file.type}`);
            return NextResponse.json({
                success: false,
                error: 'Tipo de archivo no válido. Se permiten PDF, JPEG, JPG y PNG.'
            }, { status: 400 });
        }

        // Preparar nueva FormData para la API
        const apiFormData = new FormData();

        // Convertir el archivo a Blob para mejor compatibilidad con dispositivos móviles
        const fileBuffer = await file.arrayBuffer();
        const blob = new Blob([fileBuffer], { type: file.type });
        apiFormData.append('file', blob, file.name || 'documento.pdf');

        const baseURL = process.env.GATEWAY_API || '';
        console.log(`[UPLOAD] URL de API: ${baseURL}/clients/${userId}/document`);

        // Mejorar configuración de Axios
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `creditoya_token=${token}`,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
            withCredentials: true,
            timeout: 30000, // 30 segundos de timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };

        console.log('[UPLOAD] Enviando solicitud a la API...');
        const responseDB = await axios.put(
            `${baseURL}/clients/${userId}/document`,
            apiFormData,
            config,
        );

        console.log('[UPLOAD] Respuesta de la API:', responseDB.data);

        return NextResponse.json({
            success: true,
            data: "Verificación de documento de identidad exitosa",
        });
    } catch (error: any) {
        console.error('[UPLOAD] Error en petición de subida de archivo:', error);
        console.error('[UPLOAD] Detalles del error:', {
            mensaje: error.message,
            respuesta: error.response?.data,
            estado: error.response?.status
        });

        // Manejo específico de errores
        if (error.response?.status === 401) {
            return NextResponse.json({
                success: false,
                error: 'No autenticado'
            }, { status: 401 });
        }

        if (error.response?.status === 413) {
            return NextResponse.json({
                success: false,
                error: 'El archivo es demasiado grande'
            }, { status: 413 });
        }

        if (error.code === 'ECONNABORTED') {
            return NextResponse.json({
                success: false,
                error: 'La conexión ha expirado. Por favor, inténtelo de nuevo.'
            }, { status: 408 });
        }

        return NextResponse.json({
            success: false,
            error: error.response?.data?.error || error.message || 'Error desconocido al subir la imagen'
        }, { status: error.response?.status || 500 });
    }
}