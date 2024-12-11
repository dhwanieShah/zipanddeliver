module.exports = {
  apps: [
    {
      name: "ZipAndDeliver",
      script: "./bin/www",
      watch: true,
      out_file: "/dev/null",
      error_file: "/dev/null",
      ignore_watch: ["node_modules", "public", "logs", "uploads"],
      env_local: {
        PORT: 4800,
        watch: true,
        NODE_ENV: "local",
        DOMAIN_URL: "http://127.0.0.1:4800",
        IMERFERENCES_DATABASE_URL: "mongodb://localhost:27017/immerch",
        DB_MONGO_URL: "mongodb://localhost:27017/zip_and_deliver",
        JWT_SECRET: "jsonwebtoken"
      },
      env: {
        PORT: 4800,
        watch: true,
        NODE_ENV: "local",
        DOMAIN_URL: "http://127.0.0.1:4800",
        IMERFERENCES_DATABASE_URL: "mongodb://localhost:27017/immerch",
        DB_MONGO_URL: "mongodb://localhost:27017/zip_and_deliver",
        JWT_SECRET: "jsonwebtoken"
      },
      env_production: {
        PORT: 4800,
        watch: true,
        NODE_ENV: "local",
        DOMAIN_URL: "http://127.0.0.1:4800",
        IMERFERENCES_DATABASE_URL: "mongodb://localhost:27017/immerch",
        DB_MONGO_URL: "mongodb://localhost:27017/zip_and_deliver",
        JWT_SECRET: "jsonwebtoken"
      },
      env_staging: {
        PORT: 4800,
        watch: true,
        NODE_ENV: "local",
        DOMAIN_URL: "http://127.0.0.1:4800",
        IMERFERENCES_DATABASE_URL: "mongodb://localhost:27017/immerch",
        DB_MONGO_URL: "mongodb://localhost:27017/zip_and_deliver",
        JWT_SECRET: "jsonwebtoken"
      },
    },
  ],
};