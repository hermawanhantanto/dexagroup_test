## Documentation Policy & Context7 MCP

> [!IMPORTANT]
> **ALWAYS consult the Context7 MCP server for up-to-date documentation.**
> Whenever working with libraries, frameworks, SDKs, or tools (including **NestJS**, **Prisma**, **Supabase**, **MySQL**, **Passport**, **Multer**, etc.), agents MUST use the `context7` MCP tools (`resolve-library-id` and `query-docs`) before assuming API structures or outdated syntax. Do not rely solely on training cutoffs.

### How to use Context7:
1. Call `resolve-library-id` with `libraryName` (e.g., `"Prisma"`, `"NestJS"`, `"Supabase"`) and the query to obtain the Context7 library ID (e.g., `/websites/prisma_io`, `/supabase/supabase`).
2. Call `query-docs` with the returned `libraryId`, `query`, and `language: "TypeScript"`.

## Code Quality & Anti-Patterns Policy

> [!IMPORTANT]
> **1. NO MAGIC STRINGS OR MAGIC NUMBERS.**
> - Never hardcode magic strings or raw values in application logic (e.g., hardcoded dummy hashes, inline secret fallbacks, raw status strings, cookie names, or unconfigured tokens).
> - Always extract constants into dedicated `constants/` files, derive them from environment configuration (`ConfigService`), or compute/initialize them dynamically during application lifecycle hooks (e.g., `onModuleInit`).
>
> **2. CLEAN CODE & DESCRIPTIVE VARIABLE NAMING.**
> - Never use cryptic, single-letter, or heavily abbreviated variable names (e.g., `_p`, `_rt`, `e`, `res_b`).
> - Use clear, intention-revealing names that describe the domain concept or purpose (e.g., `_excludedPassword`, `_excludedRefreshToken`, `sanitizedUserProfile`).
>
> **3. NO AUTOMATIC CODE COMMENTS (`//`).**
> - Do not automatically add inline comments (`// ...`) to explain what code does.
> - Write clean, self-documenting code with clear method and variable names. Only add comments if explicitly requested by the user.
>
> **4. STRICT SCOPE ADHERENCE.**
> - Strictly implement ONLY what the user explicitly requests.
> - Never preemptively add speculative, 'nice-to-have', or unrequested endpoints, methods, services, or features beyond the direct user prompt. Keep the codebase focused and free of scope creep.
>
> **5. DYNAMIC OBJECT ITERATION FOR PARTIAL UPDATES.**
> - Prefer dynamic iteration (`Object.entries`) over repetitive cascading `if (dto.field !== undefined)` statements when building partial update payloads.
> - Handle special-case transformations (e.g., password hashing, email uniqueness checks, string trimming, and date/type parsing for Prisma/database schemas) cleanly inside the loop while delegating remaining fields dynamically.
