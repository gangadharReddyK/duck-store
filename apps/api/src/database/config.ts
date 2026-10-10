export const config = {
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: parseInt(process.env.DB_PORT ?? '3307', 10),
  dbUser: process.env.DB_USER ?? 'root',
  dbPassword: process.env.DB_PASSWORD ?? 'root',
  dbName: process.env.DB_NAME ?? 'duckstore',
  port: parseInt(process.env.PORT ?? '3000', 10),
};