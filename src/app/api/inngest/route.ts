import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "../../../inngest/functions";
import { agentRun, sitePlan } from "../../../inngest/agent-network";

// Expose GET, POST, and PUT for Inngest Dev Server auto-discovery
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, agentRun, sitePlan],
});