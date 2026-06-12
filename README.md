# Neoenergia LMS — MVP

Plataforma corporativa de **Gestão de Aprendizagem (LMS)** da Neoenergia, construída em **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**.

Este MVP demonstra, ponta a ponta, os macroblocos funcionais previstos no escopo, com dados simulados (mock) e estado gerenciado no cliente (React Context + persistência em `localStorage`).

## Macroblocos implementados

| Macrobloco | Rota | Destaques |
|---|---|---|
| Gestão de Identidade e Controle de Acesso | `/identidade` | Perfis/RBAC, matriz de permissões, políticas de segurança, sessões |
| Módulo Administração | `/administracao` | Gestão de usuários, busca, departamentos, cadastro de usuário |
| Módulo Aprendizagem | `/aprendizagem/*` | Cursos, Turmas, Trilhas e Calendário acadêmico |
| Módulo Repositório de Conteúdos | `/repositorio` | Biblioteca de mídias (vídeo, PDF, SCORM, imagem, link) |
| Módulo Comunicação | `/comunicacao` | Campanhas multicanal (e-mail, push, mural, SMS) e métricas |
| Módulo Relatórios e Analytics | `/relatorios` | KPIs, gráficos de matrícula, conclusão e perfis |
| Módulo Configurações e Parametrização | `/configuracoes` | Identidade visual, segurança e regras de negócio |
| Automação e Integrações | `/integracoes` | SSO/RH/BI, conectores e automações (toggle on/off) |
| Auditoria e Logs | `/auditoria` | Trilha de auditoria com filtros por severidade |

## Controle de acesso (RBAC)

A navegação, funcionalidades e permissões são definidas pelo perfil e unidade do usuário autenticado (`src/lib/rbac.ts`).

### Perfis confirmados

| Perfil | Escopo |
|---|---|
| **Administrador Premium** | Acesso total — todas unidades, configurações globais, identidade, integrações e auditoria |
| **Administrador de Unidade** | Escopo da própria unidade (Coelba, Celpe, Coelce, Elektro) — usuários, turmas, conteúdos, comunicação e relatórios |

### Perfis complementares (a confirmar)

Gestor de Conteúdo, Instrutor e Aluno já estão mapeados com permissões provisórias, marcados como **"A confirmar"** na tela de Identidade & Acesso.

### Demonstração

Na tela de login, use os botões de acesso rápido:

- `ana.souza@neoenergia.com` → Administrador Premium (Holding)
- `bruno.ferreira@neoenergia.com` → Administrador de Unidade (Celpe · PE)
- `carla.mendes@neoenergia.com` → Gestor de Conteúdo *(a confirmar)*
- `henrique.castro@neoenergia.com` → Instrutor *(a confirmar)*
- `diego.alves@neoenergia.com` → Aluno *(a confirmar)*

O perfil e a unidade vêm do cadastro do usuário — menus e dados são filtrados automaticamente.

## Como executar

```bash
npm install
npm run dev
# abra http://localhost:3000
```

Build de produção:

```bash
npm run build && npm start
```

## Arquitetura

```
src/
├── app/
│   ├── login/                 # Autenticação (demo)
│   └── (app)/                 # Área autenticada (sidebar + header)
│       ├── dashboard/
│       ├── identidade/
│       ├── administracao/
│       ├── aprendizagem/{cursos,turmas,trilhas,calendario}/
│       ├── repositorio/
│       ├── comunicacao/
│       ├── relatorios/
│       ├── configuracoes/
│       ├── integracoes/
│       └── auditoria/
├── components/                # UI, Sidebar, Header, Icon, charts
└── lib/                       # types, mock-data, store (Context), nav
```

## Observações

- Dados são **simulados** e residem em `src/lib/mock-data.ts`.
- Ações como criar usuário/curso, alterar configurações e ligar/desligar automações
  são refletidas no estado e geram registros na **Auditoria**.
- Para produção: substituir o store por uma API (ex.: Next Route Handlers + banco),
  integrar SSO real (SAML/OIDC) e provedores de RH/BI.
