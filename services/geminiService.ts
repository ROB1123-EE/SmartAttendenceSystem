import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY as string;
const ai = new GoogleGenAI({ apiKey: API_KEY });

function dataUrlToBlob(dataUrl: string) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export const recognizeFace = async (webcamImage: string, registeredStudents: { name: string, imageDataUrl: string }[]): Promise<string | null> => {
    if (registeredStudents.length === 0) {
        return null;
    }

    try {
        const webcamBlob = dataUrlToBlob(webcamImage);
        const webcamBase64 = await blobToBase64(webcamBlob);

        const imageParts = [{
            inlineData: {
                mimeType: 'image/jpeg',
                data: webcamBase64,
            },
        }];

        const studentImageParts = await Promise.all(registeredStudents.map(async (student) => {
            const studentBlob = dataUrlToBlob(student.imageDataUrl);
            const studentBase64 = await blobToBase64(studentBlob);
            return {
                inlineData: {
                    mimeType: 'image/png',
                    data: studentBase64,
                }
            };
        }));
        
        const prompt = `From the first image provided (the webcam feed), identify which of the following people is present. Respond with only the name of the person from the provided list if you are confident. The list of people is in the subsequent images. The names are in order: [${registeredStudents.map(s => s.name).join(', ')}]. If no one from the list is clearly identifiable, respond with "Unknown".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, ...studentImageParts, {text: prompt}] },
        });

        const text = response.text.trim();

        if (text && text !== "Unknown" && registeredStudents.some(s => s.name === text)) {
            return text;
        }

        return null;
    } catch (error) {
        console.error("Error in face recognition:", error);
        return null;
    }
};
