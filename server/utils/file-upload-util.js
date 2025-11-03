import axios from "axios"
import fs from "fs";

export const handleFileUpload = async (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uniqueFileName = `${Date.now()}-${file.filename}-${file.originalname}`;
    const region = 'sg'; // or 'ny', 'la', etc.
    const storageZone = 'your-storage-zone-name';

    const response = await axios.put(
        `https://${region}.storage.bunnycdn.com/${storageZone}/${uniqueFileName}`,
        fileStream,
        {
            headers: {
                "AccessKey": "your-access-key",
                "Content-Type": file.mimetype,
            }
        }
    );

    if (response.data) {
        return `https://${region}.b-cdn.net/${uniqueFileName}`;
    }
    else {
        throw new Error("File upload failed");
    }
}