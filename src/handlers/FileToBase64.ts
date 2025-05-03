// Función para convertir File a Base64
interface FileToBase64Result {
    result: string | ArrayBuffer | null;
}

function convertFileToBase64(file: File): Promise<FileToBase64Result['result']> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}