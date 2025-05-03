// types/client.ts

export interface ClientUser {
    id: string;
    email: string;
    names: string;
    firstLastName: string;
    secondLastName?: string;
    avatar?: string;
    isBan?: boolean;
}

export interface JwtPayload {
    sub: string;
    email: string;
    type: string;
    exp: number;
}

export interface LoadingState {
    isLoading: boolean;
    message: string;
    error: string | null;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: ClientUser | null;
}

export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: {
        email: string;
        password: string;
        names: string;
        firstLastName: string;
        secondLastName?: string;
    }) => Promise<boolean>;
    logout: () => Promise<void>;
    isActivated: () => boolean;
    startLoading: (key: string, message?: string) => void;
    stopLoading: (key: string, error?: string | null) => void;
    getLoadingState: (key: string) => LoadingState;
    withLoading: <T>(
        key: string,
        loadingMessage: string,
        operation: () => Promise<T>
    ) => Promise<{ success: boolean; data?: T; error?: string }>;
    loadingStates: Record<string, LoadingState>;
}