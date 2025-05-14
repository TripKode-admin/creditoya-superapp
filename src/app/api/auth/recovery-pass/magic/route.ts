import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Generar un magic link para recuperación de contraseña
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { email, userType } = await request.json();

    if (!email || !userType) {
      return NextResponse.json({
        success: false,
        error: 'Email y tipo de usuario son requeridos'
      }, { status: 400 });
    }

    // Validar el tipo de usuario
    if (userType !== 'client' && userType !== 'intranet') {
      return NextResponse.json({
        success: false,
        error: 'Tipo de usuario inválido'
      }, { status: 400 });
    }

    const baseURL = process.env.GATEWAY_API;
    const response = await axios.post(
      `${baseURL}/password-reset/generate-link`,
      { email, userType }
    );

    return NextResponse.json({
      success: true,
      message: 'Enlace de recuperación enviado',
      ...response.data
    });
  } catch (error: any) {
    console.error('Error al generar magic link:', error.response?.status, error.response?.data);
    
    // Si el usuario no existe, para prevenir enumeración de usuarios,
    // devolvemos un mensaje de éxito pero no enviamos ningún correo realmente
    if (error.response?.status === 404) {
      return NextResponse.json({
        success: true,
        message: 'Si tu email está registrado, recibirás un enlace de recuperación'
      });
    }
    
    // Otros errores
    const errorMessage = error.response?.data?.message || 'Error al generar enlace de recuperación';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: error.response?.status || 500 });
  }
}