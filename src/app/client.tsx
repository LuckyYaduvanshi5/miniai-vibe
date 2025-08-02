'use client';

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from 'react';

export function Client() {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "Lucky" }));
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">tRPC Response:</h1>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
