// /api/auth/register/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: any;
}

export async function POST(request: Request) {
    try {
        // Extract registration data from request
        const userData = await request.json();

        // Validate required fields
        const requiredFields = ['email', 'password', 'names', 'firstLastName'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return NextResponse.json({
                    success: false,
                    error: `El campo ${field} es requerido`
                }, { status: 400 });
            }
        }

        // Forward the registration request to the backend API
        const response = await axios.post(
            `${process.env.GATEWAY_API}/auth/register/client`,
            userData
        );

        console.log(response)

        // Extract token and user data from response
        const { accessToken, user } = response.data;

        // Create API response object
        const apiResponse: ApiResponse = {
            success: true,
            data: {
                user,
                accessToken // Include for client code compatibility, but primary token is in HTTP-only cookie
            }
        };

        // Create response with HTTP-only cookie
        const res = NextResponse.json(apiResponse);

        // Set authentication cookie
        res.cookies.set({
            name: 'creditoya_token',
            value: accessToken,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return res;
    } catch (error: any) {
        // Extract error details from the backend response
        const status = error.response?.status || 500;
        const message = error.response?.data?.message ||
            error.message ||
            'Error durante el registro';

        // Format error response
        const apiResponse: ApiResponse = {
            success: false,
            error: message
        };

        return NextResponse.json(apiResponse, { status });
    }
}