"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
// @ts-ignore
import domtoimage from "dom-to-image";

export default function DownloadButton({ cardRef, fileName }: { cardRef: React.RefObject<HTMLDivElement>, fileName: string }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            const dataUrl = await domtoimage.toPng(cardRef.current, {
                quality: 0.95,
                bgcolor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = dataUrl;
            link.click();

        } catch (e) {
            console.error("Download Error:", e);
            alert("Download failed. Please check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
            {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Download className="h-5 w-5" />}
            Download Warranty Card
        </button>
    )
}
