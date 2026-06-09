# 🎱 Bingo Generator

Sistema web para geração de cartelas de bingo em PDF com painel administrativo.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express + Puppeteer |
| Banco de dados | Firebase Firestore |
| Storage (imagens) | Firebase Storage |
| Autenticação | Firebase Auth (email + senha fixa) |

## Estrutura do projeto

```
bingo-generator/
├── frontend/          # React app
│   └── src/
│       ├── components/  # Componentes reutilizáveis
│       ├── pages/       # Login, Dashboard, Novo Bingo
│       ├── hooks/       # useAuth, useBingo
│       ├── services/    # Firebase, API calls
│       └── contexts/    # AuthContext
├── backend/           # Node.js + Express
│   └── src/
│       ├── routes/      # /api/bingo
│       ├── services/    # PDF generator (Puppeteer)
│       └── templates/   # HTML da cartela de bingo
└── README.md
```

## Setup

### Pré-requisitos
- Node.js 18+
- Conta no Firebase (Firestore + Storage + Auth)

### 1. Clone e instale dependências

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Configure o Firebase

No Firebase Console:
1. Crie um projeto
2. Ative **Authentication** → Email/Password
3. Ative **Firestore Database**
4. Ative **Storage**
5. Crie o usuário: `angelo.silveira09@gmail.com` com uma senha
6. Copie as credenciais do projeto

### 3. Variáveis de ambiente

**frontend/.env**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:3001
```

**backend/.env**
```env
PORT=3001
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FRONTEND_URL=http://localhost:5173
```

### 4. Firebase Admin SDK (backend)

No Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada.
Salve o JSON e configure as variáveis acima.

### 5. Rode o projeto

```bash
# Backend
cd backend && npm run dev

# Frontend (outro terminal)
cd frontend && npm run dev
```

## Funcionalidades

- ✅ Login com email + senha (único usuário)
- ✅ Criar novo bingo com: prêmio, data, horário, local, valor, nº de cartelas
- ✅ Upload de imagem do prêmio
- ✅ Geração de cartelas com números únicos por coluna (regras do bingo)
- ✅ Download do PDF com todas as cartelas
- ✅ Histórico de bingos gerados

## Regras do Bingo (geração de números)

| Coluna | Range |
|--------|-------|
| B | 1–15 |
| I | 16–30 |
| N | 31–45 (centro = FREE) |
| G | 46–60 |
| O | 61–75 |
