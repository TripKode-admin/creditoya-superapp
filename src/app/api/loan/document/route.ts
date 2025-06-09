import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
        const cookieStore = await cookies();
        const token = cookieStore.get('creditoya_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación no encontrado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'document_id es requerido' },
        { status: 400 }
      );
    }

    // Realizar la petición al backend
    const response = await axios.get(
      `${process.env.GATEWAY_API}/pdfs/document/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Solo incluir el header Cookie si es necesario para tu backend
          Cookie: `intranet-token=${token}`
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 segundos timeout
      }
    );

    // Crear la respuesta con los headers correctos
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/octet-stream',
        'Content-Disposition': response.headers['content-disposition'] || 'attachment',
        'Content-Length': response.headers['content-length'] || response.data.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("Error downloading document:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Error downloading document';

      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}