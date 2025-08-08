import { Suspense } from "react";
import { Client } from "./client";

export default async function Home() {
    return (
        <main className="min-h-screen p-8">
            <Suspense fallback={<p>Loading...</p>}>
                <Client />
            </Suspense>
        </main>
    );
}