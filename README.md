# ChatGPT Clone
This is ChatGPT clone is built with **Next.js 16**, **AI SDK**, **OpenAI**, **Prisma**, **PostgreSQL**, **Clerk Authentication**, and **TanStack Query**.
The application supports real-time AI streaming, persistent conversations, web search, Branching, dark mode, and a clean ChatGPT-inspired interface.

- [Demo](https://chatgpt-clone-eight-silk.vercel.app/)

---

## 🛠 Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn/UI
- TanStack Query

### Backend

- Next.js Route Handlers
- Server Actions
- Prisma ORM
- PostgreSQL

### AI

- Vercel AI SDK
- OpenAI
- Streaming Responses
- AI Tools
- Web Search

### Authentication

- Clerk


## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/chatgpt-clone.git
```
```bash
cd chatgpt-clone
```

---

### Install dependencies

```bash
npm install
```

### Setup environment variables

Create a `.env` file.

```env
DATABASE_URL=

OPENAI_API_KEY=

CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

TAVILY_API_KEY=
```
---

### Run Prisma

```bash
npx prisma generate
```

```bash
npx prisma migrate dev
```

---

### Start development server

```bash
npm run dev
```

