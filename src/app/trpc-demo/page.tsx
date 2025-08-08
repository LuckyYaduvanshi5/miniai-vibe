import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TrpcDemoClient } from "./client";

export default async function TrpcDemoPage() {
  const qc = getQueryClient();
  await qc.prefetchQuery(trpc.createAI.queryOptions({ text: "Lucky" }));

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">tRPC Demo</h1>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense fallback={<p>Loading…</p>}>
          <TrpcDemoClient />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
}
