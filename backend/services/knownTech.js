const KNOWN_TECH = new Set([
    /* =========================
       PROGRAMMING LANGUAGES
    ========================= */
    "c", "c++", "java", "javascript", "typescript", "python", "go", "rust",
    "php", "ruby", "kotlin", "swift", "scala", "bash",
    "r",

    /* =========================
       WEB / FRONTEND
    ========================= */
    "html", "css", "sass", "less",
    "tailwind", "bootstrap",
    "react", "redux", "next", "vue", "nuxt", "angular", "jquery",
    "vite", "webpack",
    "three.js", "d3.js", "chart.js", "framer motion",

    /* =========================
       BACKEND / FRAMEWORKS
    ========================= */
    "node", "express", "nest", "fastify",
    "django", "flask",
    "spring", "spring boot",
    "laravel", "rails", "asp.net",

    /* =========================
       APIs / COMMUNICATION
    ========================= */
    "rest api", "graphql", "grpc",
    "websockets", "webrtc",

    /* =========================
       DATABASES / STORAGE
    ========================= */
    "sql", "nosql",
    "mongodb", "mongoose",
    "mysql", "postgresql", "sqlite",
    "mariadb",
    "oracle", "oracle sql",
    "mssql",
    "redis", "redis streams",
    "cassandra", "dynamodb",
    "couchdb", "couchbase",
    "neo4j",
    "influxdb",
    "elasticsearch", "opensearch",
    "firebase", "firestore",
    "supabase",
    "amazon rds", "amazon aurora",

    /* =========================
       AUTH / SECURITY
    ========================= */
    "jwt", "oauth", "oauth2",
    "csrf", "cors",
    "bcrypt", "argon2",
    "authentication", "authorization",

    /* =========================
       DEVOPS / CLOUD
    ========================= */
    "git", "github", "gitlab", "bitbucket",
    "github actions",
    "docker", "docker compose", "kubernetes",
    "terraform", "ansible", "helm",
    "linux", "nginx", "apache", "pm2",
    "aws", "ec2", "s3", "lambda",
    "gcp", "azure",
    "vercel", "netlify", "cloudflare",
    "serverless",

    /* =========================
       SYSTEM / SOFTWARE CONCEPTS
    ========================= */
    "system design",
    "low level design",
    "high level design",
    "microservices architecture",
    "monolithic architecture",
    "distributed systems",
    "scalability",
    "high availability",
    "fault tolerance",
    "load balancing",
    "caching",
    "rate limiting",

    /* =========================
       TESTING
    ========================= */
    "jest", "mocha", "chai",
    "cypress", "playwright", "selenium",
    "junit", "pytest",

    /* =========================
       TOOLS
    ========================= */
    "postman", "swagger", "openapi",
    "multer", "cloudinary",

    /* =========================
       DATA / AI / ML
    ========================= */
    "numpy", "pandas", "scikit-learn",
    "tensorflow", "pytorch", "opencv",
    "machine learning", "deep learning",
    "nlp", "computer vision",
    "neural networks",
    "faiss", "pinecone", "chroma",
    "embeddings",
    "llm", "langchain",

    /* =========================
       DATA ENGINEERING
    ========================= */
    "airflow", "spark", "hadoop",
    "hive", "bigquery",
    "redshift", "snowflake",
    "etl", "data pipelines",

    /* =========================
       MOBILE
    ========================= */
    "react native", "flutter",
    "android", "ios",

    /* =========================
       CORE ENGINEERING
    ========================= */
    "embedded systems",
    "microcontrollers",
    "pcb design",
    "vlsi",

    /* =========================
       NON-TECH : BUSINESS / MANAGEMENT
    ========================= */
    "project management",
    "program management",
    "operations management",
    "product management",
    "business analysis",
    "requirements analysis",
    "stakeholder management",
    "resource planning",
    "process improvement",
    "risk management",
    "change management",

    /* =========================
       NON-TECH : FINANCE / ANALYTICS
    ========================= */
    "financial analysis",
    "budgeting",
    "forecasting",
    "cost analysis",
    "financial modeling",
    "accounting",
    "bookkeeping",
    "taxation",
    "auditing",
    "excel",
    "advanced excel",

    /* =========================
       NON-TECH : SALES / MARKETING
    ========================= */
    "digital marketing",
    "content marketing",
    "email marketing",
    "seo",
    "sem",
    "social media marketing",
    "google analytics",
    "market research",
    "brand management",
    "crm",

    /* =========================
       NON-TECH : HR / PEOPLE OPS
    ========================= */
    "talent acquisition",
    "recruitment",
    "employee engagement",
    "performance management",
    "hr analytics",
    "payroll management",
    "compliance management",
    "training and development",

    /* =========================
       NON-TECH : OPERATIONS / SUPPORT
    ========================= */
    "customer support",
    "customer success",
    "client relationship management",
    "service delivery",
    "operations analysis",
    "supply chain management",
    "inventory management",

    /* =========================
       NON-TECH : DESIGN / MEDIA
    ========================= */
    "ui design",
    "ux design",
    "figma",
    "adobe xd",
    "photoshop",
    "illustrator",
    "video editing",
    "content creation"
]);

module.exports = { KNOWN_TECH };
