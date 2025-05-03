import { validateToken } from '@/lib/validate-token';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers"
import { User } from '@/types/full';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  // Obtener el token de las cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('creditoya_token')?.value;

  // Validar el token
  await validateToken(token);

  // Configurar headers con el token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `creditoya_token=${token}`
    },
    withCredentials: true
  };

  try {
    let response;
    const baseURL = process.env.GATEWAY_API || '';

    if (!userId) {
      // Si no se proporciona user_id, obtener el usuario autenticado actual
      response = await axios.get(`${baseURL}/auth/me/client`, config);
    } else {
      // Si se proporciona user_id, obtener datos para ese usuario específico
      response = await axios.get(`${baseURL}/clients/${userId}`, config);
    }

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error en petición:', error.response?.status, error.response?.data);

    // Manejar errores específicos
    if (error.response?.status === 401) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    // Otros errores
    return NextResponse.json({
      success: false,
      error: error.response?.data?.error || error.message || 'Error desconocido'
    }, { status: error.response?.status || 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  // Get update data from request
  const { field, value } = await request.json();

  if (!field || value === undefined) {
    return NextResponse.json({  
      success: false,
      error: 'Field and value are required'
    }, { status: 400 });
  }

  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('creditoya_token')?.value;

  // Validate token
  await validateToken(token);

  // Configure headers with token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `creditoya_token=${token}`
    },
    withCredentials: true
  };

  try {
    if (!userId) throw new Error("user_id is required in query");

    const baseURL = process.env.GATEWAY_API || '';

    // Send properly formatted data: data with the field and value directly
    const response = await axios.put(
      `${baseURL}/clients/${userId}`,
      { [field]: value }, // This formats it correctly for Prisma
      config
    );

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Error en petición:', error.response?.status, error.response?.data);

    // Handle specific errors
    if (error.response?.status === 401) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    // Other errors
    return NextResponse.json({
      success: false,
      error: error.response?.data?.error || error.message || 'Error desconocido'
    }, { status: error.response?.status || 500 });
  }
}