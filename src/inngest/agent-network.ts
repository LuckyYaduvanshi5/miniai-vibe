import { createAgent, createNetwork, gemini } from "@inngest/agent-kit";
import { inngest } from "./client";
import prisma from "@/lib/db";

// Shared light-weight shapes for safely extracting text outputs.
interface TextChunk { type: "text"; role?: string; content: string }
interface RunRecord { agentName?: string; createdAt?: string; history?: TextChunk[]; output?: TextChunk[] }
interface InternalRunState { state?: { _results?: RunRecord[] } }

// Goal: support a "Lovable.dev clone" style workflow where a user says something like:
//   "Build a SaaS landing page for an AI meeting notes app"
// and background jobs iterate: spec -> structure -> components -> copy -> code scaffold output.
// We'll start with a single multi-purpose agent and a high-level event. Later this could split
// into multiple specialized agents (spec, ux, components, copywriter, codegen) with routing.

// Website builder agent (initial single-agent version). Responsibilities:
// 1. Interpret user intent (product, audience, tone) and draft a concise SPEC.
// 2. Propose a SITE MAP and section/component list.
// 3. Produce COMPONENT DESCRIPTIONS (props & purpose) for key UI pieces (Hero, FeaturesGrid, CTA, Pricing, FAQ, Footer).
// 4. Draft MARKETING COPY (headline, subheadline, feature bullets, CTA text) in a friendly, clear voice.
// 5. Output a CODE PLAN: list of React component filenames with brief responsibilities.
// Output Format Guidelines (append each stage labeled):
// SPEC:\n...
// SITE_MAP:\n...
// COMPONENTS:\n...
// COPY:\n...
// CODE_PLAN:\n...
// Only include plain markdown; no executable code yet.
const builderAgent = createAgent({
  name: "builder",
  description: "Generates product spec, sitemap, component plan, marketing copy, and code plan for a web app.",
  system: [
    "You are a senior full-stack product & UX architect plus marketing copywriter.",
    "Given a short user request, produce staged output to scaffold a modern SaaS marketing site.",
    "Output EXACTLY these section labels in this order, each alone on its own line followed by a colon, with blank line after each label's content:",
    "SPEC:",
    "SITE_MAP:",
    "COMPONENTS:",
    "COPY:",
    "CODE_PLAN:",
    "Rules: No code blocks, no additional sections, no prefixes like SECTION_. Keep it concise and plain markdown.",
  ].join("\n"),
  model: gemini({ model: "gemini-1.5-flash" }),
});

// Network – presently one agent; later we can add specialized agents and routing rules.
const builderNetwork = createNetwork({
  name: "Site Builder Network",
  agents: [builderAgent],
  defaultModel: gemini({ model: "gemini-1.5-flash" }),
  maxIter: 2, // two iterations usually enough for structured staged answer
});

// Inngest function that runs the AgentKit network
// Trigger with event name: "ai/agent.run" and data: { input: string }
export const agentRun = inngest.createFunction(
  { id: "agent-run" },
  { event: "ai/agent.run" },
  async ({ event /*, step*/ }) => {
    interface AgentRunEventData { input?: string }
    const input: string = (event.data as AgentRunEventData | undefined)?.input ?? "Build a landing page for an AI task manager app.";

    // Execute the network (multi-stage builder)
    const result = await builderNetwork.run(input);

    // Sanitize the result to avoid leaking provider credentials by returning
    // only the model outputs instead of the full network object.
  const rawResults = (result as unknown as InternalRunState).state?._results;
  const outputs: string[] = Array.isArray(rawResults)
      ? (rawResults as RunRecord[])
          .flatMap((r) =>
            Array.isArray(r.output)
              ? r.output
                  .filter((o): o is TextChunk => o?.type === "text" && typeof o?.content === "string")
                  .map((o) => o.content)
              : [],
          )
          .filter((s): s is string => typeof s === "string")
      : [];

  const final = (outputs.slice().reverse().find((s) => s.trim().length > 0)) ?? outputs[outputs.length - 1] ?? null;

    // Combine all outputs into a single markdown answer (use last non-empty as canonical final).
    const combined = outputs.join("\n\n");

    // Extract sections for persistence
    const lines = combined.split(/\r?\n/);
    const map: Record<string,string[]> = {};
    let current: string | null = null;
    for (const line of lines) {
      const m = line.match(/^([A-Z_]+):\s*$/);
      if (m) { current = m[1]; map[current] = []; continue; }
      if (current) map[current].push(line);
    }
    const data = {
      idea: input,
      full: combined,
      spec: map["SPEC"]?.join("\n").trim() || null,
      siteMap: map["SITE_MAP"]?.join("\n").trim() || null,
      components: map["COMPONENTS"]?.join("\n").trim() || null,
      copy: map["COPY"]?.join("\n").trim() || null,
      codePlan: map["CODE_PLAN"]?.join("\n").trim() || null,
    };
    // Persist plan (non-fatal if migration not applied yet)
    try {
      // @ts-ignore sitePlan model appears after prisma generate
      await prisma.sitePlan.create({ data });
    } catch (err) {
      console.warn("[agent-run] Failed to persist site plan (migration missing?)", err);
    }
    return { ok: true, mode: "builder:v1", input, message: final, full: combined, sections: data };
  },
);

// High-level alias event: ai/site.plan (wraps ai/agent.run logic but distinct trigger)
export const sitePlan = inngest.createFunction(
  { id: "site-plan" },
  { event: "ai/site.plan" },
  async ({ event }) => {
  interface SitePlanEventData { idea?: string; input?: string }
  const ideaData = event.data as SitePlanEventData | undefined;
  const idea: string = ideaData?.idea ?? ideaData?.input ?? "Landing page for a generic SaaS";
    const result = await builderNetwork.run(idea);
  const rawResults = (result as unknown as InternalRunState).state?._results;
    const outputs: string[] = Array.isArray(rawResults)
      ? (rawResults as RunRecord[]).flatMap(r => (r.output||[]).filter(o => o?.type === 'text' && typeof o.content === 'string').map(o => o.content))
      : [];
    const combined = outputs.join("\n\n");
    const lines = combined.split(/\r?\n/);
    const map: Record<string,string[]> = {};
    let current: string | null = null;
    for (const line of lines) {
      const m = line.match(/^([A-Z_]+):\s*$/);
      if (m) { current = m[1]; map[current] = []; continue; }
      if (current) map[current].push(line);
    }
    try {
      // @ts-ignore sitePlan model appears after prisma generate
      await prisma.sitePlan.create({
        data: {
          idea,
          full: combined,
          spec: map["SPEC"]?.join("\n").trim() || null,
          siteMap: map["SITE_MAP"]?.join("\n").trim() || null,
          components: map["COMPONENTS"]?.join("\n").trim() || null,
          copy: map["COPY"]?.join("\n").trim() || null,
          codePlan: map["CODE_PLAN"]?.join("\n").trim() || null,
        }
      });
    } catch (err) {
      console.warn("[site-plan] Failed to persist site plan (migration missing?)", err);
    }
    return { ok: true, idea, full: combined };
  }
);
