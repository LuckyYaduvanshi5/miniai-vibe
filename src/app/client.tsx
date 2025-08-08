'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

export function Client() {
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const resetTimerRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    async function triggerJob() {
        try {
            setStatus("pending");
            // Abort any in-flight request to prevent overlap
            abortRef.current?.abort();
            const ac = new AbortController();
            abortRef.current = ac;

            const res = await fetch("/api/jobs/hello", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    // Optionally include an auth header if you set INNGEST_JOB_TOKEN
                    // "x-job-token": process.env.NEXT_PUBLIC_JOB_TOKEN ?? "",
                },
                body: JSON.stringify({}),
                signal: ac.signal,
            });
            if (!res.ok) throw new Error("Request failed");
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
            resetTimerRef.current = window.setTimeout(() => setStatus("idle"), 1500);
        }
    }

    useEffect(() => {
        return () => {
            // Cleanup pending timer and abort any in-flight request
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
            abortRef.current?.abort();
        };
    }, []);
    
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
