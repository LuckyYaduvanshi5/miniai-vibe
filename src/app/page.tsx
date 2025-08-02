import { Suspense } from "react";
import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Client } from "./client";
import { trpc } from "@/trpc/server";

export default async function Home() {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(trpc.createAI.queryOptions({ text: "Lucky" }));

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">tRPC with Next.js</h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<p>Loading...</p>}>
                    <Client />
                </Suspense>
            </HydrationBoundary>
        </main>
    );
}