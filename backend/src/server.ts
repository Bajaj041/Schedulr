import { app } from './app.js';

const PORT = Number(process.env.PORT) || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Schedulr Backend Server listening on http://localhost:${PORT}`);
  console.log(`✨ API Health Check at http://localhost:${PORT}/api/health`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 You can stop the existing process by running: npx kill-port ${PORT} (or lsof -ti:${PORT} | xargs kill -9)`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
