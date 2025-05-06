import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // Mejorar logging para debugging
    console.log('[SELFIE_UPLOAD] Iniciando proceso de subida de selfie');

    // Obtener y validar token
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    if (!token) {
        console.warn('[SELFIE_UPLOAD] No se encontró token de autenticación');
        return NextResponse.json({
            success: false,
            error: 'No autenticado'
        }, { status: 401 });
    }

    try {
        await validateToken(token);
    } catch (tokenError: any) {
        console.error('[SELFIE_UPLOAD] Error validando token:', tokenError.message);
        return NextResponse.json({
            success: false,
            error: tokenError.message || 'Token inválido'
        }, { status: 401 });
    }

    try {
        // Extraer y validar los datos del formulario
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('user_id') as string;

        // Mejorar logging
        console.log('[SELFIE_UPLOAD] Datos recibidos:', {
            filePresente: !!file,
            fileType: file?.type,
            fileSize: file?.size,
            userId: userId
        });

        if (!file) {
            console.warn('[SELFIE_UPLOAD] No se proporcionó ningún archivo');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            }, { status: 400 });
        }

        if (!userId) {
            console.warn('[SELFIE_UPLOAD] No se proporcionó identificador de usuario');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún identificador'
            }, { status: 401 });
        }

        // Validar el tamaño del archivo (límite de 5MB para selfies)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            console.warn(`[SELFIE_UPLOAD] Archivo demasiado grande: ${file.size} bytes`);
            return NextResponse.json({
                success: false,
                error: 'La imagen es demasiado grande. El tamaño máximo es 5MB.'
            }, { status: 400 });
        }

        // Validar el tipo de archivo (solo permitir imágenes)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            console.warn(`[SELFIE_UPLOAD] Tipo de archivo no válido: ${file.type}`);
            return NextResponse.json({
                success: false,
                error: 'Tipo de archivo no válido. Se permiten solo JPEG, JPG y PNG.'
            }, { status: 400 });
        }

        // Preparar nueva FormData para la API
        const apiFormData = new FormData();

        // Convertir el archivo a Blob para mejor compatibilidad con dispositivos móviles
        const fileBuffer = await file.arrayBuffer();
        const blob = new Blob([fileBuffer], { type: file.type });
        apiFormData.append('file', blob, file.name || 'selfie.jpg');

        const baseURL = process.env.GATEWAY_API || '';
        console.log(`[SELFIE_UPLOAD] URL de API: ${baseURL}/clients/${userId}/document/selfie`);

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

        console.log('[SELFIE_UPLOAD] Enviando solicitud a la API...');
        const responseDB = await axios.put(
            `${baseURL}/clients/${userId}/document/selfie`,
            apiFormData,
            config
        );

        console.log('[SELFIE_UPLOAD] Respuesta de la API:', responseDB.data);

        return NextResponse.json({
            success: true,
            data: "Verificación de imagen con CC actualizada",
        });
    } catch (error: any) {
        console.error('[SELFIE_UPLOAD] Error en petición de subida de imagen:', error);
        console.error('[SELFIE_UPLOAD] Detalles del error:', {
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
                error: 'La imagen es demasiado grande'
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