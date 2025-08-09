'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Client() {
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const resetTimerRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Agent run UI state
    const [agentInput, setAgentInput] = useState("");
    const [agentStatus, setAgentStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const agentResetTimerRef = useRef<number | null>(null);
    const agentAbortRef = useRef<AbortController | null>(null);

    // Site plan UI state
    const [planIdea, setPlanIdea] = useState("");
    const [planStatus, setPlanStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const planResetTimerRef = useRef<number | null>(null);
    const planAbortRef = useRef<AbortController | null>(null);

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

    async function triggerAgent() {
        try {
            // basic validation
            if (!agentInput.trim()) {
                setAgentStatus("error");
                if (agentResetTimerRef.current) window.clearTimeout(agentResetTimerRef.current);
                agentResetTimerRef.current = window.setTimeout(() => setAgentStatus("idle"), 1200);
                return;
            }

            setAgentStatus("pending");
            // Abort any in-flight agent request
            agentAbortRef.current?.abort();
            const ac = new AbortController();
            agentAbortRef.current = ac;

            const headers: Record<string, string> = {
                "content-type": "application/json",
            };
            // Optionally include a token if you exposed it as NEXT_PUBLIC_JOB_TOKEN
            if (process.env.NEXT_PUBLIC_JOB_TOKEN) {
                headers["x-job-token"] = process.env.NEXT_PUBLIC_JOB_TOKEN as string;
            }

            const res = await fetch("/api/jobs/agent", {
                method: "POST",
                headers,
                body: JSON.stringify({ input: agentInput }),
                signal: ac.signal,
            });
            if (!res.ok) throw new Error("Request failed");
            setAgentStatus("success");
        } catch {
            setAgentStatus("error");
        } finally {
            if (agentResetTimerRef.current) {
                window.clearTimeout(agentResetTimerRef.current);
            }
            agentResetTimerRef.current = window.setTimeout(() => setAgentStatus("idle"), 1500);
        }
    }

    async function triggerSitePlan() {
        try {
            if (!planIdea.trim()) {
                setPlanStatus("error");
                if (planResetTimerRef.current) window.clearTimeout(planResetTimerRef.current);
                planResetTimerRef.current = window.setTimeout(() => setPlanStatus("idle"), 1200);
                return;
            }
            setPlanStatus("pending");
            planAbortRef.current?.abort();
            const ac = new AbortController();
            planAbortRef.current = ac;
            const headers: Record<string,string> = { "content-type": "application/json" };
            if (process.env.NEXT_PUBLIC_JOB_TOKEN) headers["x-job-token"] = process.env.NEXT_PUBLIC_JOB_TOKEN as string;
            const res = await fetch("/api/jobs/site-plan", { method: "POST", headers, body: JSON.stringify({ idea: planIdea }), signal: ac.signal });
            if (!res.ok) throw new Error("Request failed");
            setPlanStatus("success");
        } catch {
            setPlanStatus("error");
        } finally {
            if (planResetTimerRef.current) window.clearTimeout(planResetTimerRef.current);
            planResetTimerRef.current = window.setTimeout(() => setPlanStatus("idle"), 1500);
        }
    }

    useEffect(() => {
        return () => {
            // Cleanup pending timer and abort any in-flight request
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
            abortRef.current?.abort();
            if (agentResetTimerRef.current) {
                window.clearTimeout(agentResetTimerRef.current);
            }
            agentAbortRef.current?.abort();
            if (planResetTimerRef.current) {
                window.clearTimeout(planResetTimerRef.current);
            }
            planAbortRef.current?.abort();
        };
    }, []);
    
    return (
        <div className="p-4 space-y-6">
            {/* Existing hello world background job */}
            <div className="flex items-center gap-3">
                <Button onClick={triggerJob} disabled={status === "pending"}>
                    {status === "pending" ? "Queuing…" : "Run background job"}
                </Button>
                {status === "success" && <span className="text-green-600">Queued</span>}
                {status === "error" && <span className="text-red-600">Failed</span>}
            </div>

            {/* AgentKit + Gemini: enqueue agent run */}
            <div className="flex flex-col gap-3 max-w-xl">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Ask the agent to write something (e.g., a short tweet)…"
                        value={agentInput}
                        onChange={(e) => setAgentInput(e.target.value)}
                        aria-label="Agent input"
                    />
                    <Button onClick={triggerAgent} disabled={agentStatus === "pending"}>
                        {agentStatus === "pending" ? "Queuing…" : "Run agent"}
                    </Button>
                </div>
                <div className="min-h-5">
                    {agentStatus === "success" && <span className="text-green-600">Queued</span>}
                    {agentStatus === "error" && <span className="text-red-600">Failed</span>}
                </div>
            </div>

            {/* Site plan (Lovable clone) job */}
            <div className="flex flex-col gap-3 max-w-xl">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Describe the product to build (e.g., 'AI meeting notes SaaS landing page')"
                        value={planIdea}
                        onChange={(e) => setPlanIdea(e.target.value)}
                        aria-label="Site plan idea"
                    />
                    <Button onClick={triggerSitePlan} disabled={planStatus === "pending"}> {planStatus === "pending" ? "Queuing…" : "Plan site"} </Button>
                </div>
                <div className="min-h-5">
                    {planStatus === "success" && <span className="text-green-600">Queued</span>}
                    {planStatus === "error" && <span className="text-red-600">Failed</span>}
                </div>
            </div>
        </div>
    );
}
