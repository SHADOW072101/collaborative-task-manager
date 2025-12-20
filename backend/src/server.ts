// backend/src/server.ts (for local development only)
import app from './index';

const PORT = process.env.PORT || 3000;

// Only start server if running locally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Health check: http://localhost:${PORT}/health`);
  });
}