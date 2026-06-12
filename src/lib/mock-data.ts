import type {
  AuditLog,
  Automation,
  CalendarEvent,
  ContentAsset,
  Course,
  Integration,
  Message,
  Permission,
  Role,
  Settings,
  Trilha,
  Turma,
  User,
  Notification,
  UserPreferences,
  Evaluation,
  Post,
  Question,
  Sala,
  Certificado,
  InteresseCurso,
  SolicitacaoMatricula,
  Destaque,
  AlertRule,
  InternalMail,
} from "./types";

const colors = ["#00a14b", "#2563eb", "#db2777", "#d97706", "#7c3aed", "#0891b2"];
const pick = (i: number) => colors[i % colors.length];

export const users: User[] = [
  { id: "u1", name: "Ana Carolina Souza", email: "ana.souza@neoenergia.com", role: "admin_premium", unitId: "holding", department: "Tecnologia", status: "ativo", lastAccess: "2026-06-12 09:41", avatarColor: pick(0) },
  { id: "u2", name: "Bruno Ferreira", email: "bruno.ferreira@neoenergia.com", role: "admin_unidade", unitId: "celpe", department: "Operações · PE", status: "ativo", lastAccess: "2026-06-12 08:10", avatarColor: pick(1) },
  { id: "u3", name: "Carla Mendes", email: "carla.mendes@neoenergia.com", role: "gestor_conteudo", unitId: "holding", department: "RH", status: "ativo", lastAccess: "2026-06-11 17:55", avatarColor: pick(2) },
  { id: "u4", name: "Diego Alves", email: "diego.alves@neoenergia.com", role: "aluno", unitId: "coelba", department: "Distribuição · BA", status: "ativo", lastAccess: "2026-06-12 07:32", avatarColor: pick(3) },
  { id: "u5", name: "Eduarda Lima", email: "eduarda.lima@neoenergia.com", role: "aluno", unitId: "elektro", department: "Comercial · SP", status: "inativo", lastAccess: "2026-05-30 14:20", avatarColor: pick(4) },
  { id: "u6", name: "Felipe Rocha", email: "felipe.rocha@neoenergia.com", role: "admin_unidade", unitId: "coelce", department: "Segurança · CE", status: "ativo", lastAccess: "2026-06-12 10:05", avatarColor: pick(5) },
  { id: "u7", name: "Gabriela Nunes", email: "gabriela.nunes@neoenergia.com", role: "aluno", unitId: "coelba", department: "Distribuição · BA", status: "bloqueado", lastAccess: "2026-06-01 11:00", avatarColor: pick(1) },
  { id: "u8", name: "Henrique Castro", email: "henrique.castro@neoenergia.com", role: "instrutor", unitId: "celpe", department: "Engenharia · PE", status: "ativo", lastAccess: "2026-06-12 09:00", avatarColor: pick(2) },
];

export const permissions: Permission[] = [
  { id: "p1", name: "Gerenciar usuários (todas unidades)", description: "Criar, editar e remover usuários em qualquer unidade", roles: ["admin_premium"] },
  { id: "p2", name: "Gerenciar usuários (unidade)", description: "Criar, editar e remover usuários da própria unidade", roles: ["admin_unidade"] },
  { id: "p3", name: "Configurações globais", description: "Parâmetros, identidade visual e regras de negócio", roles: ["admin_premium"] },
  { id: "p4", name: "Publicar cursos", description: "Publicar e arquivar cursos", roles: ["admin_premium", "admin_unidade", "gestor_conteudo", "instrutor"] },
  { id: "p5", name: "Gerenciar turmas", description: "Criar e gerenciar turmas", roles: ["admin_premium", "admin_unidade", "instrutor"] },
  { id: "p6", name: "Relatórios (todas unidades)", description: "Dashboards e analytics corporativos", roles: ["admin_premium"] },
  { id: "p7", name: "Relatórios (unidade)", description: "Dashboards e analytics da unidade", roles: ["admin_unidade"] },
  { id: "p8", name: "Gerenciar repositório", description: "Upload e gestão de conteúdos", roles: ["admin_premium", "admin_unidade", "gestor_conteudo"] },
  { id: "p9", name: "Disparar comunicações", description: "Enviar campanhas e avisos", roles: ["admin_premium", "admin_unidade"] },
  { id: "p10", name: "Configurar integrações", description: "Gerenciar SSO, RH e APIs", roles: ["admin_premium"] },
  { id: "p11", name: "Consultar auditoria", description: "Acessar logs e trilhas de auditoria", roles: ["admin_premium"] },
  { id: "p12", name: "Realizar cursos", description: "Inscrever-se e concluir cursos", roles: ["admin_premium", "admin_unidade", "gestor_conteudo", "instrutor", "aluno"] },
];

export const courses: Course[] = [
  { id: "c1", title: "Segurança em Redes Elétricas (NR-10)", category: "Segurança", instructor: "Carla Mendes", unitId: "celpe", modality: "hibrido", audience: "Distribuição", workload: 40, status: "publicado", enrolled: 312, completion: 78, cover: "#0b5" },
  { id: "c2", title: "Compliance e Código de Ética", category: "Compliance", instructor: "Henrique Castro", unitId: "holding", modality: "online", audience: "Todos colaboradores", workload: 8, status: "publicado", enrolled: 1240, completion: 92, cover: "#25a" },
  { id: "c3", title: "Excelência no Atendimento ao Cliente", category: "Comercial", instructor: "Carla Mendes", unitId: "coelba", modality: "online", audience: "Comercial", workload: 12, status: "publicado", enrolled: 480, completion: 64, cover: "#d27" },
  { id: "c4", title: "Liderança e Gestão de Equipes", category: "Liderança", instructor: "Henrique Castro", unitId: "celpe", modality: "presencial", audience: "Gestores", workload: 24, status: "publicado", enrolled: 96, completion: 55, cover: "#d96" },
  { id: "c5", title: "Transição Energética e Sustentabilidade", category: "ESG", instructor: "Carla Mendes", unitId: "holding", modality: "online", audience: "Todos colaboradores", workload: 6, status: "rascunho", enrolled: 0, completion: 0, cover: "#7c3" },
  { id: "c6", title: "Operação de Subestações", category: "Técnico", instructor: "Henrique Castro", unitId: "celpe", modality: "hibrido", audience: "Distribuição", workload: 60, status: "publicado", enrolled: 154, completion: 41, cover: "#089" },
  { id: "c7", title: "LGPD na Prática", category: "Compliance", instructor: "Henrique Castro", unitId: "holding", modality: "online", audience: "Todos colaboradores", workload: 4, status: "arquivado", enrolled: 890, completion: 88, cover: "#64748b" },
];

export const turmas: Turma[] = [
  { id: "t1", courseId: "c1", name: "NR-10 · Turma 2026.1", instructor: "Carla Mendes", unitId: "celpe", salaId: "s1", startDate: "2026-06-15", endDate: "2026-07-20", capacity: 40, enrolled: 38, status: "agendada" },
  { id: "t2", courseId: "c4", name: "Liderança · Junho", instructor: "Henrique Castro", unitId: "celpe", salaId: "s2", startDate: "2026-06-02", endDate: "2026-06-30", capacity: 25, enrolled: 25, status: "em_andamento" },
  { id: "t3", courseId: "c6", name: "Subestações · Recife", instructor: "Henrique Castro", unitId: "celpe", salaId: "s3", startDate: "2026-05-10", endDate: "2026-06-10", capacity: 20, enrolled: 18, status: "concluida" },
  { id: "t4", courseId: "c3", name: "Atendimento · Online Contínuo", instructor: "Carla Mendes", unitId: "coelba", startDate: "2026-06-01", endDate: "2026-12-31", capacity: 500, enrolled: 220, status: "em_andamento" },
];

export const salas: Sala[] = [
  { id: "s1", name: "Sala Técnica A", unitId: "celpe", location: "Recife · Anexo 2", capacity: 40, resources: ["Projetor", "Quadro", "EPI demo"], status: "disponivel" },
  { id: "s2", name: "Auditório Liderança", unitId: "celpe", location: "Recife · Sede", capacity: 30, resources: ["Projetor", "Som", "Videoconferência"], status: "disponivel" },
  { id: "s3", name: "Centro de Treinamento Subestações", unitId: "celpe", location: "Recife · CTD", capacity: 20, resources: ["Maquetes", "EPI", "Projetor"], status: "disponivel" },
  { id: "s4", name: "Sala Bahia Norte", unitId: "coelba", location: "Salvador · Regional", capacity: 35, resources: ["Projetor", "Computadores"], status: "manutencao" },
];

export const trilhas: Trilha[] = [
  {
    id: "tr1", name: "Onboarding Neoenergia", description: "Jornada inicial para novos colaboradores",
    courseIds: ["c2", "c7", "c3"], audience: "Novos colaboradores", progress: 72, status: "ativa",
    steps: [
      { order: 1, courseId: "c2", title: "Ética e Compliance", required: true },
      { order: 2, courseId: "c7", title: "LGPD na Prática", required: true },
      { order: 3, courseId: "c3", title: "Atendimento ao Cliente", required: false },
    ],
  },
  {
    id: "tr2", name: "Formação de Eletricistas", description: "Capacitação técnica de campo",
    courseIds: ["c1", "c6"], audience: "Distribuição", progress: 45, status: "ativa",
    steps: [
      { order: 1, courseId: "c1", title: "NR-10 — Segurança", required: true },
      { order: 2, courseId: "c6", title: "Operação de Subestações", required: true },
    ],
  },
  {
    id: "tr3", name: "Trilha de Liderança", description: "Desenvolvimento de gestores",
    courseIds: ["c4", "c2"], audience: "Gestores", progress: 60, status: "ativa",
    steps: [
      { order: 1, courseId: "c4", title: "Liderança e Gestão", required: true },
      { order: 2, courseId: "c2", title: "Compliance para Gestores", required: true },
    ],
  },
];

export const certificados: Certificado[] = [
  { id: "cert1", userId: "u4", userName: "Diego Alves", courseId: "c2", courseTitle: "Compliance e Código de Ética", unitId: "coelba", issuedAt: "2026-05-20", expiresAt: "2028-05-20", status: "valido" },
  { id: "cert2", userId: "u8", userName: "Henrique Castro", courseId: "c1", courseTitle: "Segurança em Redes Elétricas (NR-10)", unitId: "celpe", issuedAt: "2025-06-10", expiresAt: "2027-06-10", status: "valido" },
  { id: "cert3", userId: "u5", userName: "Eduarda Lima", courseId: "c7", courseTitle: "LGPD na Prática", unitId: "elektro", issuedAt: "2024-01-15", expiresAt: "2026-01-15", status: "expirado" },
];

export const interesses: InteresseCurso[] = [
  { id: "int1", userId: "u4", userName: "Diego Alves", userEmail: "diego.alves@neoenergia.com", courseId: "c6", courseTitle: "Operação de Subestações", unitId: "coelba", registeredAt: "2026-06-08", notified: true },
  { id: "int2", userId: "u7", userName: "Gabriela Nunes", userEmail: "gabriela.nunes@neoenergia.com", courseId: "c4", courseTitle: "Liderança e Gestão de Equipes", unitId: "coelba", registeredAt: "2026-06-10", notified: false },
  { id: "int3", userId: "u5", userName: "Eduarda Lima", userEmail: "eduarda.lima@neoenergia.com", courseId: "c5", courseTitle: "Transição Energética e Sustentabilidade", unitId: "elektro", registeredAt: "2026-06-11", notified: false },
];

export const solicitacoes: SolicitacaoMatricula[] = [
  { id: "sol1", userId: "u4", userName: "Diego Alves", courseId: "c1", courseTitle: "Segurança em Redes Elétricas (NR-10)", turmaId: "t1", unitId: "coelba", requestedAt: "2026-06-10 14:30", status: "pendente" },
  { id: "sol2", userId: "u7", userName: "Gabriela Nunes", courseId: "c3", courseTitle: "Excelência no Atendimento ao Cliente", turmaId: "t4", unitId: "coelba", requestedAt: "2026-06-09 09:15", status: "aprovada", reviewer: "Bruno Ferreira" },
  { id: "sol3", userId: "u5", userName: "Eduarda Lima", courseId: "c4", courseTitle: "Liderança e Gestão de Equipes", turmaId: "t2", unitId: "elektro", requestedAt: "2026-06-07 11:00", status: "rejeitada", reviewer: "Bruno Ferreira" },
];

export const questions: Question[] = [
  { id: "q1", text: "Quais EPIs são obrigatórios em trabalhos em altura?", type: "multipla", category: "Segurança", unitId: "celpe", usageCount: 24 },
  { id: "q2", text: "O código de ética se aplica a terceiros?", type: "verdadeiro", category: "Compliance", unitId: "holding", usageCount: 56 },
  { id: "q3", text: "Descreva o procedimento de bloqueio de energia.", type: "dissertativa", category: "Segurança", unitId: "celpe", usageCount: 12 },
  { id: "q4", text: "Qual o prazo para resposta ao cliente (SLA)?", type: "multipla", category: "Comercial", unitId: "coelba", usageCount: 18 },
  { id: "q5", text: "Qual norma regula trabalhos em instalações elétricas?", type: "multipla", category: "Segurança", unitId: "celpe", usageCount: 31 },
];

export const evaluations: Evaluation[] = [
  { id: "av1", name: "Prova NR-10 · Módulo Final", courseId: "c1", turmaId: "t1", unitId: "celpe", questionIds: ["q1", "q3", "q5"], questionCount: 3, status: "aplicada", dueDate: "2026-07-20", appliedAt: "2026-06-01 10:00" },
  { id: "av2", name: "Quiz Compliance", courseId: "c2", unitId: "holding", questionIds: ["q2"], questionCount: 1, status: "publicada", dueDate: "2026-12-31" },
  { id: "av3", name: "Avaliação Liderança", courseId: "c4", turmaId: "t2", unitId: "celpe", questionIds: ["q2", "q4"], questionCount: 2, status: "rascunho", dueDate: "2026-06-30" },
];

export const destaques: Destaque[] = [
  { id: "d1", title: "Campanha de Segurança — Junho", body: "Reforce os procedimentos de bloqueio antes de iniciar atividades em campo.", unitId: "holding", visible: true, pinned: true, publishedAt: "2026-06-10 08:00" },
  { id: "d2", title: "Novo curso ESG disponível", body: "Inscreva-se na trilha de Transição Energética.", unitId: "holding", visible: true, pinned: false, publishedAt: "2026-06-08 14:30" },
  { id: "d3", title: "Manutenção programada", body: "Plataforma indisponível domingo, 14/06, das 20h às 22h.", unitId: "celpe", visible: true, pinned: true, publishedAt: "2026-06-11 09:00", expiresAt: "2026-06-15" },
];

export const alertRules: AlertRule[] = [
  { id: "ar1", name: "Prazo LGPD", criteria: "7 dias antes do vencimento do curso", channel: "sistema", audience: "Pendentes LGPD", unitId: "holding", enabled: true, lastTriggered: "2026-06-12 09:00" },
  { id: "ar2", name: "Turma quase lotada", criteria: "Ocupação ≥ 90% da capacidade", channel: "email", audience: "Gestores de turma", unitId: "celpe", enabled: true, lastTriggered: "2026-06-11 16:20" },
  { id: "ar3", name: "Certificado expirando", criteria: "30 dias antes da validade", channel: "push", audience: "Colaboradores certificados", unitId: "holding", enabled: false },
];

export const internalMails: InternalMail[] = [
  { id: "im1", fromUserId: "u2", fromName: "Bruno Ferreira", toUserId: "u4", toName: "Diego Alves", subject: "Matrícula NR-10 aprovada", body: "Sua solicitação de matrícula na turma NR-10 foi aprovada. Acesse o calendário para ver as datas.", unitId: "coelba", read: false, sentAt: "2026-06-11 10:30" },
  { id: "im2", fromUserId: "u1", fromName: "Ana Carolina Souza", toUserId: "u2", toName: "Bruno Ferreira", subject: "Relatório mensal Celpe", body: "Segue consolidado de conclusões da unidade para revisão.", unitId: "celpe", read: true, sentAt: "2026-06-10 15:00" },
];

export const posts: Post[] = [
  { id: "post1", title: "Campanha de Segurança — Junho", body: "Reforce os procedimentos de bloqueio antes de iniciar atividades em campo.", author: "Carla Mendes", unitId: "holding", status: "publicado", publishedAt: "2026-06-10 09:00" },
  { id: "post2", title: "Novo curso ESG disponível", body: "Inscreva-se na trilha de Transição Energética.", author: "Ana Carolina Souza", unitId: "holding", status: "publicado", publishedAt: "2026-06-08 14:30" },
];

export const events: CalendarEvent[] = [
  { id: "e1", title: "Aula NR-10 · Módulo 1", date: "2026-06-15", type: "presencial", turma: "NR-10 · Turma 2026.1", courseId: "c1", turmaId: "t1", salaId: "s1", modality: "hibrido" },
  { id: "e2", title: "Webinar Transição Energética", date: "2026-06-18", type: "webinar", courseId: "c5", modality: "online" },
  { id: "e3", title: "Prova Final · Liderança", date: "2026-06-28", type: "prova", turma: "Liderança · Junho", courseId: "c4", turmaId: "t2", salaId: "s2", modality: "presencial" },
  { id: "e4", title: "Prazo conclusão LGPD", date: "2026-06-30", type: "prazo", courseId: "c7", modality: "online" },
  { id: "e5", title: "Aula Subestações · Prática", date: "2026-06-20", type: "aula", turma: "Subestações · Recife", courseId: "c6", turmaId: "t3", salaId: "s3", modality: "hibrido" },
  { id: "e6", title: "Início turma Atendimento", date: "2026-06-01", type: "aula", courseId: "c3", turmaId: "t4", modality: "online" },
];

export const contents: ContentAsset[] = [
  { id: "a1", name: "Manual NR-10 2026.pdf", type: "pdf", size: "4.2 MB", category: "Segurança", unitId: "celpe", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-20", downloads: 842, usedIn: ["curso", "biblioteca", "avaliacao"] },
  { id: "a2", name: "Vídeo - Procedimento de Bloqueio.mp4", type: "video", size: "128 MB", category: "Segurança", unitId: "celpe", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-22", downloads: 410, usedIn: ["curso", "biblioteca"] },
  { id: "a3", name: "Curso LGPD (SCORM).zip", type: "scorm", size: "22 MB", category: "Compliance", unitId: "holding", uploadedBy: "Henrique Castro", uploadedAt: "2026-04-10", downloads: 1203, usedIn: ["curso", "biblioteca"] },
  { id: "a4", name: "Infográfico ESG.png", type: "imagem", size: "1.1 MB", category: "ESG", unitId: "holding", uploadedBy: "Ana Carolina Souza", uploadedAt: "2026-06-01", downloads: 96, usedIn: ["comunicacao", "biblioteca"] },
  { id: "a5", name: "Política de Atendimento.pdf", type: "pdf", size: "2.8 MB", category: "Comercial", unitId: "coelba", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-15", downloads: 357, usedIn: ["curso", "avaliacao"] },
  { id: "a6", name: "Portal de Normas Técnicas", type: "link", size: "—", category: "Técnico", unitId: "coelce", uploadedBy: "Henrique Castro", uploadedAt: "2026-03-30", downloads: 540, usedIn: ["biblioteca"] },
];

export const messages: Message[] = [
  { id: "m1", title: "Campanha: Conclua a trilha de Onboarding", channel: "email", audience: "Novos colaboradores", status: "enviado", sentAt: "2026-06-10 09:00", openRate: 64 },
  { id: "m2", title: "Lembrete: Prova Final de Liderança", channel: "push", audience: "Liderança · Junho", status: "enviado", sentAt: "2026-06-11 14:00", openRate: 81 },
  { id: "m3", title: "Aviso: Manutenção da plataforma", channel: "mural", audience: "Todos", status: "agendado", sentAt: "2026-06-14 20:00", openRate: 0 },
  { id: "m4", title: "Prazo LGPD encerra em 7 dias", channel: "sms", audience: "Pendentes LGPD", status: "rascunho", sentAt: "—", openRate: 0 },
];

export const integrations: Integration[] = [
  { id: "i1", name: "Azure AD (SSO)", type: "SSO", status: "conectado", lastSync: "2026-06-12 10:00" },
  { id: "i2", name: "SAP SuccessFactors", type: "RH", status: "conectado", lastSync: "2026-06-12 06:00" },
  { id: "i3", name: "Power BI", type: "BI", status: "conectado", lastSync: "2026-06-12 08:30" },
  { id: "i4", name: "Webhook Certificados", type: "Webhook", status: "erro", lastSync: "2026-06-11 23:10" },
  { id: "i5", name: "API Pública LMS", type: "API", status: "desconectado", lastSync: "—" },
];

export const automations: Automation[] = [
  { id: "au1", name: "Matrícula automática no Onboarding", trigger: "Novo colaborador no RH", action: "Inscrever na trilha Onboarding", enabled: true, runs: 312 },
  { id: "au2", name: "Lembrete de curso a vencer", trigger: "7 dias antes do prazo", action: "Enviar e-mail e push", enabled: true, runs: 1840 },
  { id: "au3", name: "Emissão de certificado", trigger: "Curso concluído", action: "Gerar certificado PDF", enabled: true, runs: 4521 },
  { id: "au4", name: "Bloqueio por inatividade", trigger: "90 dias sem acesso", action: "Inativar usuário", enabled: false, runs: 24 },
];

export const auditLogs: AuditLog[] = [
  { id: "l1", user: "ana.souza@neoenergia.com", action: "Editou permissões do perfil Admin. de Unidade", module: "Identidade", ip: "10.2.31.5", timestamp: "2026-06-12 09:41:22", severity: "alerta" },
  { id: "l2", user: "bruno.ferreira@neoenergia.com", action: "Publicou curso 'NR-10' (Celpe)", module: "Aprendizagem", ip: "10.2.44.18", timestamp: "2026-06-12 08:12:03", severity: "info" },
  { id: "l3", user: "system", action: "Falha na sincronização do Webhook Certificados", module: "Integrações", ip: "—", timestamp: "2026-06-11 23:10:55", severity: "critico" },
  { id: "l4", user: "bruno.ferreira@neoenergia.com", action: "Enviou comunicação para 'Celpe'", module: "Comunicação", ip: "10.2.10.9", timestamp: "2026-06-11 14:02:40", severity: "info" },
  { id: "l5", user: "ana.souza@neoenergia.com", action: "Excluiu usuário 'teste01'", module: "Administração", ip: "10.2.31.5", timestamp: "2026-06-10 16:30:11", severity: "alerta" },
  { id: "l6", user: "system", action: "5 tentativas de login malsucedidas", module: "Identidade", ip: "189.40.2.77", timestamp: "2026-06-10 02:15:00", severity: "critico" },
];

export const settings: Settings = {
  orgName: "Neoenergia",
  language: "pt-BR",
  timezone: "America/Recife",
  passwordMinLength: 10,
  mfaRequired: true,
  certificateValidity: 24,
  approvalRequired: true,
  brandColor: "#00a14b",
};

export const defaultPreferences: UserPreferences = {
  theme: "light",
  language: "pt-BR",
  emailNotifications: true,
  pushNotifications: true,
  compactSidebar: false,
};

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Prazo de conclusão — LGPD",
    message: "Você tem 7 dias para concluir o curso LGPD na Prática.",
    type: "prazo",
    read: false,
    timestamp: "Há 2 horas",
    href: "/aprendizagem/cursos",
  },
  {
    id: "n2",
    title: "Nova turma disponível",
    message: "NR-10 · Turma 2026.1 aberta para inscrições na Celpe.",
    type: "curso",
    read: false,
    timestamp: "Há 5 horas",
    href: "/aprendizagem/turmas",
  },
  {
    id: "n3",
    title: "Manutenção programada",
    message: "A plataforma ficará indisponível no domingo, 14/06, das 20h às 22h.",
    type: "info",
    read: false,
    timestamp: "Ontem",
  },
  {
    id: "n4",
    title: "Certificado emitido",
    message: "Seu certificado de Compliance e Código de Ética está disponível.",
    type: "curso",
    read: true,
    timestamp: "12/06",
    href: "/aprendizagem/cursos",
  },
  {
    id: "n5",
    title: "Tentativas de login detectadas",
    message: "Foram registradas tentativas de acesso não autorizadas na sua conta.",
    type: "alerta",
    read: true,
    timestamp: "10/06",
  },
];

/** Acessos diários ao sistema (série para RF-020) */
export const dailyAccesses: { date: string; count: number }[] = [
  { date: "2026-05-14", count: 6120 },
  { date: "2026-05-15", count: 6340 },
  { date: "2026-05-16", count: 5890 },
  { date: "2026-05-17", count: 2100 },
  { date: "2026-05-18", count: 1980 },
  { date: "2026-05-19", count: 7010 },
  { date: "2026-05-20", count: 7280 },
  { date: "2026-05-21", count: 7150 },
  { date: "2026-05-22", count: 6920 },
  { date: "2026-05-23", count: 3200 },
  { date: "2026-05-24", count: 2800 },
  { date: "2026-05-25", count: 7480 },
  { date: "2026-05-26", count: 7620 },
  { date: "2026-05-27", count: 7810 },
  { date: "2026-05-28", count: 8020 },
  { date: "2026-05-29", count: 7940 },
  { date: "2026-05-30", count: 4100 },
  { date: "2026-05-31", count: 3600 },
  { date: "2026-06-01", count: 8200 },
  { date: "2026-06-02", count: 8350 },
  { date: "2026-06-03", count: 8420 },
  { date: "2026-06-04", count: 8580 },
  { date: "2026-06-05", count: 8710 },
  { date: "2026-06-06", count: 4200 },
  { date: "2026-06-07", count: 3800 },
  { date: "2026-06-08", count: 8890 },
  { date: "2026-06-09", count: 9020 },
  { date: "2026-06-10", count: 9180 },
  { date: "2026-06-11", count: 9310 },
  { date: "2026-06-12", count: 8420 },
];

/** Perfis para exibição na matriz de permissões (ordem de apresentação) */
export const matrixRoles: Role[] = [
  "admin_premium",
  "admin_unidade",
  "gestor_conteudo",
  "instrutor",
  "aluno",
];
