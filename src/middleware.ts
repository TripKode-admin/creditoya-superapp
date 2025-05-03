// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Clave para almacenamiento del token de cliente - Exactamente la misma que en el ClientAuthProvider
const TOKEN_KEY = 'creditoya_token';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log(`Middleware verificando ruta: ${pathname}`);

    // Obtener el token para verificar autenticación
    const token = request.cookies.get(TOKEN_KEY)?.value;
    console.log(`Middleware: Token presente: ${!!token}`);

    // Verificar si el usuario está autenticado
    const isAuthenticated = token ? isValidToken(token) : false;

    // Si está en la ruta principal y está autenticado, redirigir al panel
    if (pathname === '/' && isAuthenticated) {
        console.log('Middleware: Usuario autenticado intentando acceder a la ruta principal, redirigiendo a panel');
        return NextResponse.redirect(new URL('/panel', request.url));
    }

    // Si es una ruta pública que no es la raíz o login, permitir acceso
    if (pathname.startsWith('/auth/')) {
        console.log('Middleware: Ruta pública, permitiendo acceso');
        return NextResponse.next();
    }

    // Si intenta acceder a login y ya está autenticado, redirigir al panel
    if ((pathname === '/auth') && isAuthenticated) {
        console.log('Middleware: Usuario autenticado intentando acceder al login/registro, redirigiendo a panel');
        return NextResponse.redirect(new URL('/panel', request.url));
    }

    // Verificar si la ruta actual está protegida
    const isPanelRoute = pathname === '/panel' || pathname.startsWith('/panel/');

    // Para rutas protegidas, verificar autenticación
    if (isPanelRoute) {
        console.log('Middleware: Ruta protegida de panel detectada');

        // Si no hay token, redirigir a login
        if (!token) {
            console.log('Middleware: No se encontró token, redirigiendo a login');
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        // Si el token no es válido (expiró), redirigir a login
        if (!isAuthenticated) {
            console.log('Middleware: Token inválido o expirado, redirigiendo a login');
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        // Validar tipo de usuario en el token
        try {
            const decoded = jwtDecode<{ type: string }>(token);
            if (decoded.type !== 'client') {
                console.log('Middleware: Token no es de cliente, redirigiendo a login');
                return NextResponse.redirect(new URL('/auth', request.url));
            }
        } catch (error) {
            console.log('Middleware: Error al validar tipo de usuario en token', error);
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        // Token válido, permitir acceso
        console.log('Middleware: Token válido, permitiendo acceso al panel');
        return NextResponse.next();
    }

    // Para cualquier otra ruta no especificada, permitir acceso
    console.log('Middleware: Ruta no especificada, permitiendo acceso');
    return NextResponse.next();
}

// Función para validar el token
function isValidToken(token: string): boolean {
    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;

        console.log(`Middleware: Expiración del token: ${new Date(decoded.exp * 1000).toISOString()}`);
        console.log(`Middleware: Hora actual: ${new Date(currentTime * 1000).toISOString()}`);
        console.log(`Middleware: Token válido: ${decoded.exp > currentTime}`);

        return decoded.exp > currentTime;
    } catch (error) {
        console.log('Middleware: Error al validar token', error);
        return false;
    }
}

// Configurar el middleware para ejecutarse en rutas específicas
export const config = {
    matcher: [
        '/',
        '/auth',
        '/panel',
        '/panel/:path*'
    ],
};