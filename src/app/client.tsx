'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

export function Client() {
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

    async function triggerJob() {
        try {
            setStatus("pending");
            const res = await fetch("/api/jobs/hello", { method: "POST" });
            if (!res.ok) throw new Error("Request failed");
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setTimeout(() => setStatus("idle"), 1500);
        }
    }
    
    return (
        <div className="p-4">
            <div className="flex items-center gap-3">
                <Button onClick={triggerJob} disabled={status === "pending"}>
                    {status === "pending" ? "Queuing…" : "Run background job"}
                </Button>
                {status === "success" && <span className="text-green-600">Queued</span>}
                {status === "error" && <span className="text-red-600">Failed</span>}
            </div>
        </div>
    );
}
