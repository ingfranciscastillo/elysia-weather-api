// src/middleware/logging.ts
import { Elysia } from 'elysia';

export const loggingMiddleware = (app: Elysia) => app.derive(async ({ request }) => {
  const start = Date.now();
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname + url.search;
  
  console.log(`🚀 ${method} ${path} - ${new Date().toISOString()}`);
  
  return {
    logEnd: (status: number) => {
      const duration = Date.now() - start;
      console.log(`✅ ${method} ${path} - ${status} (${duration}ms)`);
    }
  };
});