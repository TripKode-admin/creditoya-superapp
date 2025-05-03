import LoadingSpinner from "../gadgets/LoadingSpinner";

function LoadingPanel({ message }: { message: string }) {
    return (
        <main className="pt-32 dark:bg-gray-900 min-h-dvh flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" color="auto" />
            <p className="mt-4 text-gray-300">{message}</p>
        </main>
    );
}

export default LoadingPanel