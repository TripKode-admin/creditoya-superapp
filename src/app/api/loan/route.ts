import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Configuración del runtime para App Router
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para subidas grandes
export const dynamic = 'force-dynamic'; // Forzar que esta ruta sea dinámica

export async function POST(request: NextRequest) {
    console.log("🚀 [API_LOAN] Iniciando procesamiento de solicitud de préstamo...");
    
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    console.log("🔐 [API_LOAN] Verificando autenticación:", {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + "..." : "No token"
    });

    try {
        await validateToken(token);
        console.log("✅ [API_LOAN] Token válido, continuando...");
    } catch (error) {
        console.error("❌ [API_LOAN] Error de autenticación:", error);
        return NextResponse.json({
            success: false,
            error: 'Token inválido o expirado'
        }, { status: 401 });
    }

    try {
        console.log("📦 [API_LOAN] Iniciando procesamiento de archivos...");

        // Verificar el tamaño del contenido antes de procesarlo
        const contentLength = request.headers.get('content-length');
        const maxRequestSize = 50 * 1024 * 1024; // 50MB para la request completa

        console.log("📏 [API_LOAN] Verificando tamaño de solicitud:", {
            contentLength: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB` : "No especificado",
            maxRequestSize: `${(maxRequestSize / 1024 / 1024).toFixed(2)}MB`
        });

        if (contentLength && parseInt(contentLength) > maxRequestSize) {
            console.error(`❌ [API_LOAN] Request demasiado grande: ${contentLength} bytes`);
            return NextResponse.json({
                success: false,
                error: 'La solicitud es demasiado grande. Máximo 50MB total.'
            }, { status: 413 });
        }

        // Parse FormData con timeout
        let formData: FormData;
        try {
            console.log("🔄 [API_LOAN] Parseando FormData...");
            formData = await request.formData();
            console.log("✅ [API_LOAN] FormData parseado exitosamente");
        } catch (error) {
            console.error('❌ [API_LOAN] Error parsing FormData:', error);
            return NextResponse.json({
                success: false,
                error: 'Error al procesar los archivos. Posible tamaño excesivo.'
            }, { status: 400 });
        }

        // Extract the form fields from formData
        console.log("📋 [API_LOAN] Extrayendo campos del formulario...");
        const phone = formData.get('phone') as string;
        const signature = formData.get('signature') as string;
        const userId = formData.get('user_id') as string;
        const entity = formData.get('entity') as string;
        const bankNumberAccount = formData.get('bankNumberAccount') as string;
        const cantity = formData.get('cantity') as string;
        const city = formData.get('city') as string;
        const residence_address = formData.get('residence_address') as string;
        const terms_and_conditions = formData.get('terms_and_conditions') === 'true';
        const isValorAgregado = formData.get('isValorAgregado') === 'true';

        console.log("📝 [API_LOAN] Campos extraídos:", {
            hasPhone: !!phone,
            hasSignature: !!signature,
            userId,
            entity,
            hasBankAccount: !!bankNumberAccount,
            cantity,
            city,
            residence_address,
            terms_and_conditions,
            isValorAgregado
        });

        // Extract file uploads
        console.log("📁 [API_LOAN] Extrayendo archivos...");
        const labor_card = formData.get('labor_card') as File | null;
        const fisrt_flyer = formData.get('fisrt_flyer') as File | null;
        const second_flyer = formData.get('second_flyer') as File | null;
        const third_flyer = formData.get('third_flyer') as File | null;

        // Log file sizes for debugging
        const files = { labor_card, fisrt_flyer, second_flyer, third_flyer };
        let totalSize = 0;

        console.log("📊 [API_LOAN] Análisis de archivos:");
        Object.entries(files).forEach(([key, file]) => {
            if (file) {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                console.log(`📄 [API_LOAN] ${key}:`, {
                    name: file.name,
                    size: `${sizeMB}MB`,
                    type: file.type
                });
                totalSize += file.size;
            } else {
                console.log(`📄 [API_LOAN] ${key}: No proporcionado`);
            }
        });

        console.log(`📊 [API_LOAN] Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

        // Validate required fields
        console.log("🔍 [API_LOAN] Iniciando validaciones...");
        
        if (!signature) {
            console.error("❌ [API_LOAN] Validación fallida: Firma faltante");
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó la firma del préstamo'
            }, { status: 400 });
        }
        
        if (!userId) {
            console.error("❌ [API_LOAN] Validación fallida: ID de usuario faltante");
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó el ID del usuario'
            }, { status: 400 });
        }
        
        if (!entity || !bankNumberAccount || !cantity || !terms_and_conditions) {
            console.error("❌ [API_LOAN] Validación fallida: Campos obligatorios faltantes", {
                hasEntity: !!entity,
                hasBankAccount: !!bankNumberAccount,
                hasCantity: !!cantity,
                termsAccepted: terms_and_conditions
            });
            return NextResponse.json({
                success: false,
                error: 'Faltan campos obligatorios'
            }, { status: 400 });
        }

        // If not isValorAgregado, check for required files
        if (!isValorAgregado && (!labor_card || !fisrt_flyer || !second_flyer || !third_flyer)) {
            console.error("❌ [API_LOAN] Validación fallida: Archivos requeridos faltantes", {
                isValorAgregado,
                files: {
                    labor_card: !!labor_card,
                    fisrt_flyer: !!fisrt_flyer,
                    second_flyer: !!second_flyer,
                    third_flyer: !!third_flyer
                }
            });
            return NextResponse.json({
                success: false,
                error: 'Faltan archivos requeridos'
            }, { status: 400 });
        }

        console.log("✅ [API_LOAN] Todas las validaciones básicas pasaron");

        // Validate file types and sizes - Límites consistentes
        console.log("🔍 [API_LOAN] Validando tipos y tamaños de archivos...");
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxFileSize = 12 * 1024 * 1024; // 12MB por archivo (más conservador)
        const maxTotalSize = 45 * 1024 * 1024; // 45MB total (dejar margen para metadata)

        console.log("📏 [API_LOAN] Límites de validación:", {
            maxFileSize: `${(maxFileSize / 1024 / 1024).toFixed(2)}MB`,
            maxTotalSize: `${(maxTotalSize / 1024 / 1024).toFixed(2)}MB`,
            allowedTypes
        });

        for (const [key, file] of Object.entries(files)) {
            if (file) {
                if (!allowedTypes.includes(file.type)) {
                    console.error(`❌ [API_LOAN] Tipo de archivo no permitido para ${key}:`, {
                        fileName: file.name,
                        fileType: file.type,
                        allowedTypes
                    });
                    return NextResponse.json({
                        success: false,
                        error: `Tipo de archivo no permitido para ${key}. Solo PDF, JPG, PNG`
                    }, { status: 400 });
                }

                if (file.size > maxFileSize) {
                    console.error(`❌ [API_LOAN] Archivo ${key} muy grande:`, {
                        fileName: file.name,
                        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                        maxSize: `${(maxFileSize / 1024 / 1024).toFixed(2)}MB`
                    });
                    return NextResponse.json({
                        success: false,
                        error: `Archivo ${key} muy grande (máximo 12MB). Actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
                    }, { status: 400 });
                }
            }
        }

        if (totalSize > maxTotalSize) {
            console.error("❌ [API_LOAN] Tamaño total excede límite:", {
                totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
                maxTotalSize: `${(maxTotalSize / 1024 / 1024).toFixed(2)}MB`
            });
            return NextResponse.json({
                success: false,
                error: `Tamaño total de archivos excede 45MB (actual: ${(totalSize / 1024 / 1024).toFixed(2)}MB)`
            }, { status: 400 });
        }

        console.log("✅ [API_LOAN] Validaciones de archivos pasaron correctamente");

        // Create a new FormData for the API request
        console.log("🔄 [API_LOAN] Preparando datos para envío al backend...");
        const apiFormData = new FormData();

        // Add body fields to the API request
        apiFormData.append('phone', phone);
        apiFormData.append('signature', signature);
        apiFormData.append('entity', entity);
        apiFormData.append('bankNumberAccount', bankNumberAccount);
        apiFormData.append('cantity', cantity);
        apiFormData.append('city', city);
        apiFormData.append('residence_address', residence_address);
        apiFormData.append('terms_and_conditions', terms_and_conditions.toString());

        // Only add isValorAgregado if it's true
        if (isValorAgregado) {
            apiFormData.append('isValorAgregado', isValorAgregado.toString());
        }

        // Add files with the exact field names expected by the FileFieldsInterceptor
        if (labor_card) apiFormData.append('labor_card', labor_card);
        if (fisrt_flyer) apiFormData.append('fisrt_flyer', fisrt_flyer);
        if (second_flyer) apiFormData.append('second_flyer', second_flyer);
        if (third_flyer) apiFormData.append('third_flyer', third_flyer);

        console.log("📤 [API_LOAN] Datos preparados para backend:", {
            userId,
            entity,
            bankNumberAccount,
            cantity,
            city,
            residence_address,
            terms_and_conditions,
            isValorAgregado,
            filesCount: Object.values(files).filter(f => f).length
        });

        // Configure the request headers with increased limits
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            timeout: 120000, // 2 minutos
            maxContentLength: 50 * 1024 * 1024, // 50MB
            maxBodyLength: 50 * 1024 * 1024, // 50MB
        };

        console.log("⚙️ [API_LOAN] Configuración de request:", {
            timeout: "120s",
            maxContentLength: "50MB",
            maxBodyLength: "50MB",
            hasAuthHeader: !!config.headers.Authorization
        });

        try {
            const baseURL = process.env.GATEWAY_API || '';

            if (!baseURL) {
                console.error("❌ [API_LOAN] GATEWAY_API no configurado");
                return NextResponse.json({
                    success: false,
                    error: 'Configuración del servidor incompleta'
                }, { status: 500 });
            }

            console.log("🌐 [API_LOAN] Enviando al backend:", {
                url: `${baseURL}/loans/${userId}`,
                baseURL: baseURL.substring(0, 20) + "..."
            });

            const startTime = Date.now();
            // Make the request to the backend API
            const loanResponse = await axios.post(
                `${baseURL}/loans/${userId}`,
                apiFormData,
                config
            );
            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`✅ [API_LOAN] Respuesta del backend recibida en ${duration}ms:`, {
                status: loanResponse.status,
                statusText: loanResponse.statusText,
                hasData: !!loanResponse.data
            });

            return NextResponse.json({
                success: true,
                data: "Creación de préstamo exitoso",
                loanDetails: loanResponse.data
            });

        } catch (apiError: any) {
            console.error("💥 [API_LOAN] Error del backend:", {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                message: apiError.message,
                code: apiError.code,
                url: apiError.config?.url
            });

            // Handle specific error cases
            if (apiError.code === 'ECONNABORTED') {
                console.error("⏰ [API_LOAN] Error de timeout - La solicitud tardó demasiado");
                return NextResponse.json({
                    success: false,
                    error: 'Timeout: La subida de archivos tardó demasiado tiempo'
                }, { status: 408 });
            }

            if (apiError.response?.status === 413) {
                console.error("📦 [API_LOAN] Error de tamaño - Archivos demasiado grandes para el backend");
                return NextResponse.json({
                    success: false,
                    error: 'Los archivos son demasiado grandes para el servidor backend'
                }, { status: 413 });
            }

            if (apiError.response?.status === 400) {
                console.error("📝 [API_LOAN] Error de validación - Datos inválidos enviados al backend");
                return NextResponse.json({
                    success: false,
                    error: apiError.response?.data?.message || 'Datos inválidos enviados al backend'
                }, { status: 400 });
            }

            if (apiError.response?.status >= 500) {
                console.error("🖥️ [API_LOAN] Error interno del servidor backend");
                return NextResponse.json({
                    success: false,
                    error: 'Error interno del servidor backend'
                }, { status: 502 });
            }

            console.error("❓ [API_LOAN] Error no clasificado:", apiError.response?.data?.message || 'Error al comunicarse con el backend');
            return NextResponse.json({
                success: false,
                error: apiError.response?.data?.message || 'Error al comunicarse con el backend'
            }, { status: apiError.response?.status || 500 });
        }

    } catch (error: any) {
        console.error("💥 [API_LOAN] Error general del servidor:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        if (error.name === 'PayloadTooLargeError' || error.message?.includes('too large')) {
            console.error("📦 [API_LOAN] Error de tamaño - Límite del servidor excedido");
            return NextResponse.json({
                success: false,
                error: 'Los archivos son muy grandes para procesar (límite del servidor)'
            }, { status: 413 });
        }

        if (error.name === 'SyntaxError' && error.message?.includes('JSON')) {
            console.error("📝 [API_LOAN] Error de sintaxis - Datos del formulario malformados");
            return NextResponse.json({
                success: false,
                error: 'Error al procesar los datos del formulario'
            }, { status: 400 });
        }

        console.error("🖥️ [API_LOAN] Error interno del servidor");
        return NextResponse.json({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

/**
 * API endpoint para obtener información de préstamos
 * Soporta tanto la obtención de un préstamo específico como el último préstamo de un usuario
 */
export async function GET(req: NextRequest) {
    // 1. Validación de autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    await validateToken(token);

    // 2. Extracción y validación de parámetros
    const { searchParams } = new URL(req.url);
    const loanId = searchParams.get('loan_id');
    const userId = searchParams.get('user_id');
    const isLatest = searchParams.get('latest') === 'true';

    try {
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Falta parámetro requerido: user_id'
            }, { status: 400 });
        }

        if (!isLatest && !loanId) {
            return NextResponse.json({
                success: false,
                error: 'Falta parámetro requerido: loan_id'
            }, { status: 400 });
        }

        // 3. Preparación de la petición
        const baseURL = process.env.GATEWAY_API || '';
        const endpoint = isLatest
            ? `${baseURL}/loans/${userId}/latest`
            : `${baseURL}/loans/${userId}/${loanId}/info`;

        const axiosConfig = {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
        };

        // 4. Ejecución de la petición
        const response = await axios.get(endpoint, axiosConfig);

        // 5. Manejo de la respuesta del backend
        if (!response.data && !isLatest) {
            throw new Error('No se recibieron datos de la API');
        }

        // Si es la petición latest y no hay préstamos (response.data es null),
        // devolver respuesta de éxito con data: null
        if (isLatest && response.data === null) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No tienes préstamos por el momento'
            });
        }

        // Verificar si hay un mensaje de error específico en la respuesta
        if (response.data && response.data.success === false) {
            throw new Error(response.data.error || 'Error al obtener información del préstamo');
        }

        return NextResponse.json({
            success: true,
            data: response.data
        });

    } catch (error: any) {
        // 6. Manejo de errores centralizado
        console.error('[API] Error en petición GET loan:', error.message);

        // Determinar el tipo de error para respuesta adecuada
        if (error.response?.status === 401) {
            return NextResponse.json({
                success: false,
                error: 'No autenticado'
            }, { status: 401 });
        }

        // Si es un error 404 y es una petición de 'latest', retornar éxito con null
        // en lugar de un error para mantener consistencia con respuestas nulas
        if (error.response?.status === 404 && searchParams.get('latest') === 'true') {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No tienes préstamos por el momento'
            });
        }

        if (error.response?.status === 404) {
            return NextResponse.json({
                success: false,
                error: 'Préstamo o usuario no encontrado'
            }, { status: 404 });
        }

        const errorStatus = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message || 'Error del servidor';

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: errorStatus });
    }
}