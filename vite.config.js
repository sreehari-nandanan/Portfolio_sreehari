import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-serverless-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith('/api/')) {
            return next();
          }

          const url = new URL(req.url, 'http://localhost:5173');
          const pathname = url.pathname;

          try {
            let handler = null;
            if (pathname === '/api/auth/login') {
              handler = (await import('./api/auth/login.js')).default;
            } else if (pathname === '/api/auth/callback') {
              handler = (await import('./api/auth/callback.js')).default;
            } else if (pathname === '/api/auth/me') {
              handler = (await import('./api/auth/me.js')).default;
            } else if (pathname === '/api/auth/logout') {
              handler = (await import('./api/auth/logout.js')).default;
            } else if (pathname === '/api/content') {
              handler = (await import('./api/content.js')).default;
            } else if (pathname === '/api/upload') {
              handler = (await import('./api/upload.js')).default;
            }

            if (handler) {
              if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body === undefined) {
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const bodyStr = Buffer.concat(chunks).toString('utf8');
                try {
                  req.body = JSON.parse(bodyStr);
                } catch {
                  req.body = bodyStr;
                }
              }

              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };

              return await handler(req, res);
            }
          } catch (err) {
            console.error('API Error in Vite dev middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }

          next();
        });
      },
    },
  ],
});
