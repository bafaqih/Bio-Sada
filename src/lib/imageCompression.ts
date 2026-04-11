import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File) => {
    const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.8
    };

    try {
        const compressedFile = await imageCompression(file, options);
        console.log(`Size sebelum: ${file.size / 1024 / 1024} MB`);
        console.log(`Size sesudah: ${compressedFile.size / 1024 / 1024} MB`);

        return compressedFile;
    } catch (error) {
        console.error("Gagal mengompres gambar:", error);
        return file; // fallback
    }
};