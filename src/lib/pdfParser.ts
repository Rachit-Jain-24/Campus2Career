import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(url: string): Promise<string> {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error("Could not extract text from the PDF. Ensure it is a valid PDF and the URL is accessible.");
    }
}

export async function extractTextFromLocalPDF(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Error extracting local PDF text:", error);
        throw new Error("Could not extract text from the uploaded PDF.");
    }
}
