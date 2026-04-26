import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File) => {
    const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: false,
        initialQuality: 0.8
    };

    try {
        const compressedFile = await imageCompression(file, options);

        return compressedFile;
    } catch (error) {
        console.error("Gagal mengompres gambar:", error);
        return file; // fallback
    }
};