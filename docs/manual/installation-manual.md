# Configure Environment Variables

Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# Generate a secret with: openssl rand -base64 32
```
Environment Variables Explained:

- DATABASE_URL: Your Neon PostgreSQL connection string
- NEXTAUTH_URL: The base URL of your application
- NEXTAUTH_SECRET: A random secret key for JWT encryption