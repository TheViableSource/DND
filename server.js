// Plesk Node.js entry point
// Plesk sets PORT via environment variable; Next.js standalone server respects it.
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";

require("./.next/standalone/server.js");
