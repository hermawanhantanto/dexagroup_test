## Documentation Policy & Context7 MCP

> [!IMPORTANT]
> **ALWAYS consult the Context7 MCP server for up-to-date documentation.**
> Whenever working with libraries, frameworks, SDKs, or tools (including **NestJS**, **Prisma**, **Supabase**, **MySQL**, **Passport**, **Multer**, etc.), agents MUST use the `context7` MCP tools (`resolve-library-id` and `query-docs`) before assuming API structures or outdated syntax. Do not rely solely on training cutoffs.

### How to use Context7:
1. Call `resolve-library-id` with `libraryName` (e.g., `"Prisma"`, `"NestJS"`, `"Supabase"`) and the query to obtain the Context7 library ID (e.g., `/websites/prisma_io`, `/supabase/supabase`).
2. Call `query-docs` with the returned `libraryId`, `query`, and `language: "TypeScript"`.


