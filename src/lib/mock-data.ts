import type {
  AuditLog,
  Automation,
  CalendarEvent,
  ContentAsset,
  Course,
  Integration,
  IntegrationConnector,
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
  ScheduledJob,
  InscricaoCurso,
  CourseModule,
  CourseLesson,
  LessonProgress,
} from "./types";

const colors = ["#2563eb", "#1d4ed8", "#3b82f6", "#0ea5e9", "#6366f1", "#0891b2"];
const pick = (i: number) => colors[i % colors.length];

export const users: User[] = [
  { id: "u1", name: "Ana Carolina Souza", email: "ana.souza@navoxi.com", role: "admin_premium", unitId: "matriz", department: "Navoxi · Tecnologia", status: "ativo", lastAccess: "2026-06-12 09:41", avatarColor: pick(0) },
  { id: "u2", name: "Bruno Ferreira", email: "bruno.ferreira@navoxi.com", role: "admin_unidade", unitId: "matriz", department: "Navoxi · Gestão Regional", status: "ativo", lastAccess: "2026-06-12 08:10", avatarColor: pick(1) },
  { id: "u3", name: "Carla Mendes", email: "carla.mendes@navoxi.com", role: "gestor_conteudo", unitId: "matriz", department: "Navoxi · RH", status: "ativo", lastAccess: "2026-06-11 17:55", avatarColor: pick(2) },
  { id: "u4", name: "Diego Alves", email: "diego.alves@navoxi.com", role: "aluno", unitId: "matriz", department: "Navoxi · Operações", status: "ativo", lastAccess: "2026-06-12 07:32", avatarColor: pick(3) },
  { id: "u5", name: "Eduarda Lima", email: "eduarda.lima@navoxi.com", role: "aluno", unitId: "matriz", department: "Navoxi · Comercial", status: "inativo", lastAccess: "2026-05-30 14:20", avatarColor: pick(4) },
  { id: "u6", name: "Felipe Rocha", email: "felipe.rocha@navoxi.com", role: "admin_unidade", unitId: "nordeste", department: "Navoxi · Segurança", status: "ativo", lastAccess: "2026-06-12 10:05", avatarColor: pick(5) },
  { id: "u7", name: "Gabriela Nunes", email: "gabriela.nunes@navoxi.com", role: "aluno", unitId: "matriz", department: "Navoxi · Tecnologia", status: "bloqueado", lastAccess: "2026-06-01 11:00", avatarColor: pick(1) },
  { id: "u8", name: "Henrique Castro", email: "henrique.castro@navoxi.com", role: "instrutor", unitId: "matriz", department: "Navoxi · Engenharia", status: "ativo", lastAccess: "2026-06-12 09:00", avatarColor: pick(2) },
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
  { id: "c1", title: "Segurança da Informação e Dados", category: "Segurança", instructor: "Carla Mendes", unitId: "matriz", modality: "hibrido", audience: "Operações", workload: 40, status: "publicado", enrolled: 312, completion: 78, cover: "#1d4ed8" },
  { id: "c2", title: "Compliance e Código de Ética", category: "Compliance", instructor: "Henrique Castro", unitId: "matriz", modality: "online", audience: "Todos colaboradores", workload: 8, status: "publicado", enrolled: 1240, completion: 92, cover: "#2563eb" },
  { id: "c3", title: "Excelência no Atendimento ao Cliente", category: "Comercial", instructor: "Carla Mendes", unitId: "nordeste", modality: "online", audience: "Comercial", workload: 12, status: "publicado", enrolled: 480, completion: 64, cover: "#d27" },
  { id: "c4", title: "Liderança e Gestão de Equipes", category: "Liderança", instructor: "Henrique Castro", unitId: "matriz", modality: "presencial", audience: "Gestores", workload: 24, status: "publicado", enrolled: 96, completion: 55, cover: "#d96" },
  { id: "c5", title: "Sustentabilidade e ESG Corporativo", category: "ESG", instructor: "Carla Mendes", unitId: "matriz", modality: "online", audience: "Todos colaboradores", workload: 6, status: "rascunho", enrolled: 0, completion: 0, cover: "#7c3" },
  { id: "c6", title: "Gestão de Infraestrutura de TI", category: "Técnico", instructor: "Henrique Castro", unitId: "matriz", modality: "hibrido", audience: "Operações", workload: 60, status: "publicado", enrolled: 154, completion: 41, cover: "#089" },
  { id: "c7", title: "LGPD na Prática", category: "Compliance", instructor: "Henrique Castro", unitId: "matriz", modality: "online", audience: "Todos colaboradores", workload: 4, status: "arquivado", enrolled: 890, completion: 88, cover: "#64748b" },
];

export const turmas: Turma[] = [
  { id: "t1", courseId: "c1", name: "Segurança da Informação · Turma 2026.1", instructor: "Carla Mendes", unitId: "matriz", salaId: "s1", startDate: "2026-06-15", endDate: "2026-07-20", capacity: 40, enrolled: 38, status: "agendada" },
  { id: "t2", courseId: "c4", name: "Liderança · Junho", instructor: "Henrique Castro", unitId: "matriz", salaId: "s2", startDate: "2026-06-02", endDate: "2026-06-30", capacity: 25, enrolled: 25, status: "em_andamento" },
  { id: "t3", courseId: "c6", name: "Infraestrutura de TI · Navoxi NE", instructor: "Henrique Castro", unitId: "matriz", salaId: "s3", startDate: "2026-05-10", endDate: "2026-06-10", capacity: 20, enrolled: 18, status: "concluida" },
  { id: "t4", courseId: "c3", name: "Atendimento · Online Contínuo", instructor: "Carla Mendes", unitId: "nordeste", startDate: "2026-06-01", endDate: "2026-12-31", capacity: 500, enrolled: 220, status: "em_andamento" },
];

export const salas: Sala[] = [
  { id: "s1", name: "Sala Técnica A", unitId: "matriz", location: "Navoxi · Matriz", capacity: 40, resources: ["Projetor", "Quadro", "Kit de demonstração"], status: "disponivel" },
  { id: "s2", name: "Auditório Liderança", unitId: "matriz", location: "Navoxi · Sede", capacity: 30, resources: ["Projetor", "Som", "Videoconferência"], status: "disponivel" },
  { id: "s3", name: "Centro de Treinamento Técnico", unitId: "matriz", location: "Navoxi · CTD", capacity: 20, resources: ["Maquetes", "Equipamentos", "Projetor"], status: "disponivel" },
  { id: "s4", name: "Sala Regional Norte", unitId: "nordeste", location: "Navoxi · Nordeste", capacity: 35, resources: ["Projetor", "Computadores"], status: "manutencao" },
];

export const trilhas: Trilha[] = [
  {
    id: "tr1", name: "Onboarding Navoxi", description: "Jornada inicial para novos colaboradores",
    courseIds: ["c2", "c7", "c3"], audience: "Novos colaboradores", progress: 72, status: "ativa",
    steps: [
      { order: 1, courseId: "c2", title: "Ética e Compliance", required: true },
      { order: 2, courseId: "c7", title: "LGPD na Prática", required: true },
      { order: 3, courseId: "c3", title: "Atendimento ao Cliente", required: false },
    ],
  },
  {
    id: "tr2", name: "Formação Técnica Navoxi", description: "Capacitação técnica corporativa",
    courseIds: ["c1", "c6"], audience: "Operações", progress: 45, status: "ativa",
    steps: [
      { order: 1, courseId: "c1", title: "Segurança da Informação", required: true },
      { order: 2, courseId: "c6", title: "Gestão de Infraestrutura de TI", required: true },
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
  { id: "cert1", userId: "u4", userName: "Diego Alves", courseId: "c2", courseTitle: "Compliance e Código de Ética", unitId: "matriz", issuedAt: "2026-05-20", expiresAt: "2028-05-20", status: "valido" },
  { id: "cert2", userId: "u8", userName: "Henrique Castro", courseId: "c1", courseTitle: "Segurança da Informação e Dados", unitId: "matriz", issuedAt: "2025-06-10", expiresAt: "2027-06-10", status: "valido" },
  { id: "cert3", userId: "u5", userName: "Eduarda Lima", courseId: "c7", courseTitle: "LGPD na Prática", unitId: "matriz", issuedAt: "2024-01-15", expiresAt: "2026-01-15", status: "expirado" },
];

export const interesses: InteresseCurso[] = [
  { id: "int1", userId: "u4", userName: "Diego Alves", userEmail: "diego.alves@navoxi.com", courseId: "c6", courseTitle: "Gestão de Infraestrutura de TI", unitId: "matriz", registeredAt: "2026-06-08", notified: true },
  { id: "int2", userId: "u7", userName: "Gabriela Nunes", userEmail: "gabriela.nunes@navoxi.com", courseId: "c4", courseTitle: "Liderança e Gestão de Equipes", unitId: "matriz", registeredAt: "2026-06-10", notified: false },
  { id: "int3", userId: "u5", userName: "Eduarda Lima", userEmail: "eduarda.lima@navoxi.com", courseId: "c5", courseTitle: "Sustentabilidade e ESG Corporativo", unitId: "matriz", registeredAt: "2026-06-11", notified: false },
];

export const solicitacoes: SolicitacaoMatricula[] = [
  { id: "sol1", userId: "u4", userName: "Diego Alves", courseId: "c1", courseTitle: "Segurança da Informação e Dados", turmaId: "t1", unitId: "matriz", requestedAt: "2026-06-10 14:30", status: "pendente" },
  { id: "sol2", userId: "u7", userName: "Gabriela Nunes", courseId: "c3", courseTitle: "Excelência no Atendimento ao Cliente", turmaId: "t4", unitId: "matriz", requestedAt: "2026-06-09 09:15", status: "aprovada", reviewer: "Bruno Ferreira" },
  { id: "sol3", userId: "u5", userName: "Eduarda Lima", courseId: "c4", courseTitle: "Liderança e Gestão de Equipes", turmaId: "t2", unitId: "matriz", requestedAt: "2026-06-07 11:00", status: "rejeitada", reviewer: "Bruno Ferreira" },
];

export const inscricoes: InscricaoCurso[] = [
  { id: "ins1", userId: "u4", userName: "Diego Alves", courseId: "c2", courseTitle: "Compliance e Código de Ética", unitId: "matriz", enrolledAt: "2026-05-15 10:00", progress: 67, status: "ativa" },
  { id: "ins2", userId: "u4", userName: "Diego Alves", courseId: "c3", courseTitle: "Excelência no Atendimento ao Cliente", turmaId: "t4", turmaName: "Atendimento · Online Contínuo", unitId: "matriz", enrolledAt: "2026-06-01 09:30", progress: 22, status: "ativa" },
  { id: "ins3", userId: "u7", userName: "Gabriela Nunes", courseId: "c2", courseTitle: "Compliance e Código de Ética", unitId: "matriz", enrolledAt: "2026-04-20 14:00", progress: 100, status: "concluida" },
];

export const courseModules: CourseModule[] = [
  { id: "m-c1-1", courseId: "c1", title: "Fundamentos de Segurança", order: 1 },
  { id: "m-c1-2", courseId: "c1", title: "Proteção de Dados", order: 2 },
  { id: "m-c2-1", courseId: "c2", title: "Princípios de Compliance", order: 1 },
  { id: "m-c2-2", courseId: "c2", title: "Conduta e Integridade", order: 2 },
  { id: "m-c3-1", courseId: "c3", title: "Atendimento de Excelência", order: 1 },
];

// Aulas com vídeos Creative Commons (Blender Foundation, CC BY) ou domínio público (NASA).
export const courseLessons: CourseLesson[] = [
  { id: "l-c1-1", courseId: "c1", moduleId: "m-c1-1", order: 1, title: "Introdução à segurança da informação", youtubeVideoId: "86YLFOog4GM", durationSec: 180 },
  { id: "l-c1-2", courseId: "c1", moduleId: "m-c1-1", order: 2, title: "Ameaças digitais e vetores de ataque", youtubeVideoId: "_L4F9fCEqWM", durationSec: 210 },
  { id: "l-c1-3", courseId: "c1", moduleId: "m-c1-2", order: 3, title: "Classificação e tratamento de dados", youtubeVideoId: "21X5lGlwtYQ", durationSec: 195 },
  { id: "l-c1-4", courseId: "c1", moduleId: "m-c1-2", order: 4, title: "Controles de acesso e autenticação", youtubeVideoId: "libKSDqviAo", durationSec: 240 },
  { id: "l-c2-1", courseId: "c2", moduleId: "m-c2-1", order: 1, title: "O que é compliance corporativo", youtubeVideoId: "YE7VzlLtp-4", durationSec: 32 },
  { id: "l-c2-2", courseId: "c2", moduleId: "m-c2-1", order: 2, title: "Marco regulatório e normas aplicáveis", youtubeVideoId: "kDkqc7ZcM3M", durationSec: 150 },
  { id: "l-c2-3", courseId: "c2", moduleId: "m-c2-1", order: 3, title: "Canal de denúncias e whistleblowing", youtubeVideoId: "QWfjPoglWLQ", durationSec: 120 },
  { id: "l-c2-4", courseId: "c2", moduleId: "m-c2-2", order: 4, title: "Conflito de interesses", youtubeVideoId: "KGksZCYuiIk", durationSec: 180 },
  { id: "l-c2-5", courseId: "c2", moduleId: "m-c2-2", order: 5, title: "Presentes, brindes e hospitalidade", youtubeVideoId: "bMeKNPGrk0c", durationSec: 200 },
  { id: "l-c2-6", courseId: "c2", moduleId: "m-c2-2", order: 6, title: "Responsabilidade individual e penalidades", youtubeVideoId: "mN0zPOpOAN8", durationSec: 220 },
  { id: "l-c3-1", courseId: "c3", moduleId: "m-c3-1", order: 1, title: "Princípios do atendimento ao cliente", youtubeVideoId: "86YLFOog4GM", durationSec: 180 },
  { id: "l-c3-2", courseId: "c3", moduleId: "m-c3-1", order: 2, title: "Escuta ativa e empatia", youtubeVideoId: "_L4F9fCEqWM", durationSec: 210 },
  { id: "l-c3-3", courseId: "c3", moduleId: "m-c3-1", order: 3, title: "Comunicação clara e objetiva", youtubeVideoId: "21X5lGlwtYQ", durationSec: 195 },
  { id: "l-c3-4", courseId: "c3", moduleId: "m-c3-1", order: 4, title: "Gestão de reclamações", youtubeVideoId: "kDkqc7ZcM3M", durationSec: 150 },
  { id: "l-c3-5", courseId: "c3", moduleId: "m-c3-1", order: 5, title: "SLA e prazos de resposta", youtubeVideoId: "QWfjPoglWLQ", durationSec: 120 },
  { id: "l-c3-6", courseId: "c3", moduleId: "m-c3-1", order: 6, title: "Atendimento omnichannel", youtubeVideoId: "KGksZCYuiIk", durationSec: 180 },
  { id: "l-c3-7", courseId: "c3", moduleId: "m-c3-1", order: 7, title: "Indicadores de satisfação (NPS/CSAT)", youtubeVideoId: "bMeKNPGrk0c", durationSec: 200 },
  { id: "l-c3-8", courseId: "c3", moduleId: "m-c3-1", order: 8, title: "Retenção e fidelização", youtubeVideoId: "mN0zPOpOAN8", durationSec: 220 },
  { id: "l-c3-9", courseId: "c3", moduleId: "m-c3-1", order: 9, title: "Encerramento e boas práticas finais", youtubeVideoId: "YE7VzlLtp-4", durationSec: 32 },
];

export const lessonProgress: LessonProgress[] = [
  { userId: "u4", lessonId: "l-c2-1", completedAt: "2026-05-16 10:00" },
  { userId: "u4", lessonId: "l-c2-2", completedAt: "2026-05-18 14:30" },
  { userId: "u4", lessonId: "l-c2-3", completedAt: "2026-05-20 09:15" },
  { userId: "u4", lessonId: "l-c2-4", completedAt: "2026-05-22 16:00" },
  { userId: "u4", lessonId: "l-c3-1", completedAt: "2026-06-02 11:00" },
  { userId: "u4", lessonId: "l-c3-2", completedAt: "2026-06-05 15:30" },
  { userId: "u7", lessonId: "l-c2-1", completedAt: "2026-04-21 10:00" },
  { userId: "u7", lessonId: "l-c2-2", completedAt: "2026-04-22 11:00" },
  { userId: "u7", lessonId: "l-c2-3", completedAt: "2026-04-23 09:00" },
  { userId: "u7", lessonId: "l-c2-4", completedAt: "2026-04-24 14:00" },
  { userId: "u7", lessonId: "l-c2-5", completedAt: "2026-04-25 10:30" },
  { userId: "u7", lessonId: "l-c2-6", completedAt: "2026-04-26 16:00" },
];

export const questions: Question[] = [
  { id: "q1", text: "Quais equipamentos de proteção são obrigatórios em trabalhos em altura?", type: "multipla", category: "Segurança", unitId: "matriz", usageCount: 24 },
  { id: "q2", text: "O código de ética se aplica a terceiros?", type: "verdadeiro", category: "Compliance", unitId: "matriz", usageCount: 56 },
  { id: "q3", text: "Descreva o procedimento de isolamento de sistemas críticos.", type: "dissertativa", category: "Segurança", unitId: "matriz", usageCount: 12 },
  { id: "q4", text: "Qual o prazo para resposta ao cliente (SLA)?", type: "multipla", category: "Comercial", unitId: "nordeste", usageCount: 18 },
  { id: "q5", text: "Qual política regula o acesso a ambientes de infraestrutura crítica?", type: "multipla", category: "Segurança", unitId: "matriz", usageCount: 31 },
];

export const evaluations: Evaluation[] = [
  { id: "av1", name: "Prova Segurança da Informação · Módulo Final", courseId: "c1", turmaId: "t1", unitId: "matriz", questionIds: ["q1", "q3", "q5"], questionCount: 3, status: "aplicada", dueDate: "2026-07-20", appliedAt: "2026-06-01 10:00" },
  { id: "av2", name: "Quiz Compliance", courseId: "c2", unitId: "matriz", questionIds: ["q2"], questionCount: 1, status: "publicada", dueDate: "2026-12-31" },
  { id: "av3", name: "Avaliação Liderança", courseId: "c4", turmaId: "t2", unitId: "matriz", questionIds: ["q2", "q4"], questionCount: 2, status: "rascunho", dueDate: "2026-06-30" },
];

export const destaques: Destaque[] = [
  { id: "d1", title: "Campanha de Segurança — Junho", body: "Reforce as boas práticas de segurança antes de iniciar atividades operacionais.", unitId: "matriz", visible: true, pinned: true, publishedAt: "2026-06-10 08:00" },
  { id: "d2", title: "Novo curso ESG disponível", body: "Inscreva-se na trilha de Sustentabilidade e ESG.", unitId: "matriz", visible: true, pinned: false, publishedAt: "2026-06-08 14:30" },
  { id: "d3", title: "Manutenção programada", body: "Plataforma indisponível domingo, 14/06, das 20h às 22h.", unitId: "matriz", visible: true, pinned: true, publishedAt: "2026-06-11 09:00", expiresAt: "2026-06-15" },
];

export const alertRules: AlertRule[] = [
  { id: "ar1", name: "Prazo LGPD", criteria: "7 dias antes do vencimento do curso", channel: "sistema", audience: "Pendentes LGPD", unitId: "matriz", enabled: true, lastTriggered: "2026-06-12 09:00" },
  { id: "ar2", name: "Turma quase lotada", criteria: "Ocupação ≥ 90% da capacidade", channel: "email", audience: "Gestores de turma", unitId: "matriz", enabled: true, lastTriggered: "2026-06-11 16:20" },
  { id: "ar3", name: "Certificado expirando", criteria: "30 dias antes da validade", channel: "push", audience: "Colaboradores certificados", unitId: "matriz", enabled: false },
];

export const internalMails: InternalMail[] = [
  { id: "im1", fromUserId: "u2", fromName: "Bruno Ferreira", toUserId: "u4", toName: "Diego Alves", subject: "Matrícula Segurança da Informação aprovada", body: "Sua solicitação de matrícula na turma Segurança da Informação foi aprovada. Acesse o calendário para ver as datas.", unitId: "matriz", read: false, sentAt: "2026-06-11 10:30" },
  { id: "im2", fromUserId: "u1", fromName: "Ana Carolina Souza", toUserId: "u2", toName: "Bruno Ferreira", subject: "Relatório mensal Navoxi", body: "Segue consolidado de conclusões da unidade para revisão.", unitId: "matriz", read: true, sentAt: "2026-06-10 15:00" },
];

export const posts: Post[] = [
  { id: "post1", title: "Campanha de Segurança — Junho", body: "Reforce as boas práticas de segurança antes de iniciar atividades operacionais.", author: "Carla Mendes", unitId: "matriz", status: "publicado", publishedAt: "2026-06-10 09:00" },
  { id: "post2", title: "Novo curso ESG disponível", body: "Inscreva-se na trilha de Sustentabilidade e ESG.", author: "Ana Carolina Souza", unitId: "matriz", status: "publicado", publishedAt: "2026-06-08 14:30" },
];

export const events: CalendarEvent[] = [
  { id: "e1", title: "Aula Segurança da Informação · Módulo 1", date: "2026-06-15", type: "presencial", turma: "Segurança da Informação · Turma 2026.1", courseId: "c1", turmaId: "t1", salaId: "s1", modality: "hibrido" },
  { id: "e2", title: "Webinar Sustentabilidade e ESG", date: "2026-06-18", type: "webinar", courseId: "c5", modality: "online" },
  { id: "e3", title: "Prova Final · Liderança", date: "2026-06-28", type: "prova", turma: "Liderança · Junho", courseId: "c4", turmaId: "t2", salaId: "s2", modality: "presencial" },
  { id: "e4", title: "Prazo conclusão LGPD", date: "2026-06-30", type: "prazo", courseId: "c7", modality: "online" },
  { id: "e5", title: "Aula Infraestrutura de TI · Prática", date: "2026-06-20", type: "aula", turma: "Infraestrutura de TI · Navoxi NE", courseId: "c6", turmaId: "t3", salaId: "s3", modality: "hibrido" },
  { id: "e6", title: "Início turma Atendimento", date: "2026-06-01", type: "aula", courseId: "c3", turmaId: "t4", modality: "online" },
];

export const contents: ContentAsset[] = [
  { id: "a1", name: "Manual Segurança da Informação 2026.pdf", type: "pdf", size: "4.2 MB", category: "Segurança", unitId: "matriz", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-20", downloads: 842, usedIn: ["curso", "biblioteca", "avaliacao"] },
  { id: "a2", name: "Vídeo - Procedimento de Isolamento.mp4", type: "video", size: "128 MB", category: "Segurança", unitId: "matriz", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-22", downloads: 410, usedIn: ["curso", "biblioteca"] },
  { id: "a3", name: "Curso LGPD (SCORM).zip", type: "scorm", size: "22 MB", category: "Compliance", unitId: "matriz", uploadedBy: "Henrique Castro", uploadedAt: "2026-04-10", downloads: 1203, usedIn: ["curso", "biblioteca"] },
  { id: "a4", name: "Infográfico ESG.png", type: "imagem", size: "1.1 MB", category: "ESG", unitId: "matriz", uploadedBy: "Ana Carolina Souza", uploadedAt: "2026-06-01", downloads: 96, usedIn: ["comunicacao", "biblioteca"] },
  { id: "a5", name: "Política de Atendimento.pdf", type: "pdf", size: "2.8 MB", category: "Comercial", unitId: "nordeste", uploadedBy: "Carla Mendes", uploadedAt: "2026-05-15", downloads: 357, usedIn: ["curso", "avaliacao"] },
  { id: "a6", name: "Portal de Normas Técnicas", type: "link", size: "—", category: "Técnico", unitId: "sul", uploadedBy: "Henrique Castro", uploadedAt: "2026-03-30", downloads: 540, usedIn: ["biblioteca"] },
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
  { id: "i3", name: "Power BI", type: "BI", status: "conectado", lastSync: "2026-06-12 08:30", brand: "power-bi" },
  { id: "i6", name: "Odilo", type: "Biblioteca", status: "conectado", lastSync: "2026-06-12 09:15", brand: "odilo" },
  { id: "i7", name: "Microsoft Teams", type: "API", status: "conectado", lastSync: "2026-06-12 11:00", brand: "teams" },
  { id: "i8", name: "LinkedIn Learning", type: "API", status: "conectado", lastSync: "2026-06-12 10:45", brand: "linkedin" },
  { id: "i9", name: "Gmail", type: "API", status: "conectado", lastSync: "2026-06-12 09:30", brand: "gmail" },
  { id: "i10", name: "Microsoft Office", type: "API", status: "conectado", lastSync: "2026-06-12 08:00", brand: "office" },
  { id: "i4", name: "Webhook Certificados", type: "Webhook", status: "erro", lastSync: "2026-06-11 23:10" },
  { id: "i5", name: "API Pública do Sistema", type: "API", status: "desconectado", lastSync: "—" },
];

export const integrationConnectors: IntegrationConnector[] = [
  {
    id: "notion",
    name: "Notion",
    brand: "notion",
    description: "Sincronize bases de conhecimento e páginas de treinamento.",
    category: "Produtividade",
  },
  {
    id: "google-meet",
    name: "Google Meet",
    brand: "google-meet",
    description: "Agende e vincule aulas ao vivo às turmas da plataforma.",
    category: "Videoconferência",
  },
  {
    id: "power-bi",
    name: "Power BI",
    brand: "power-bi",
    description: "Dashboards de aprendizagem e indicadores de desempenho.",
    category: "BI",
  },
  {
    id: "gmail",
    name: "Gmail",
    brand: "gmail",
    description: "Envie convites, lembretes e certificados por e-mail corporativo.",
    category: "E-mail",
  },
  {
    id: "powerpoint",
    name: "Microsoft PowerPoint",
    brand: "powerpoint",
    description: "Importe e exiba apresentações diretamente nos cursos.",
    category: "Produtividade",
  },
  {
    id: "linkedin",
    name: "LinkedIn Learning",
    brand: "linkedin",
    description: "Catálogo externo de cursos profissionais integrado.",
    category: "Aprendizagem",
  },
  {
    id: "odilo",
    name: "Odilo",
    brand: "odilo",
    description: "Biblioteca digital corporativa com e-books, audiobooks e revistas.",
    category: "Biblioteca",
    featured: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    brand: "teams",
    description: "Sincronize turmas virtuais e calendário de treinamentos.",
    category: "Comunicação",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    brand: "whatsapp",
    description: "Lembretes e notificações de cursos via mensagens.",
    category: "Comunicação",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    brand: "outlook",
    description: "Calendário corporativo e convites de treinamento.",
    category: "E-mail",
  },
  {
    id: "excel",
    name: "Microsoft Excel",
    brand: "excel",
    description: "Planilhas de acompanhamento e relatórios exportáveis.",
    category: "Produtividade",
  },
  {
    id: "word",
    name: "Microsoft Word",
    brand: "word",
    description: "Materiais em documento integrados ao repositório.",
    category: "Produtividade",
  },
  {
    id: "office",
    name: "Microsoft Office",
    brand: "office",
    description: "Suite completa Word, Excel e PowerPoint na plataforma.",
    category: "Produtividade",
  },
  {
    id: "zoom",
    name: "Zoom",
    brand: "zoom",
    description: "Salas virtuais para aulas síncronas e webinars.",
    category: "Videoconferência",
  },
];

export const automations: Automation[] = [
  { id: "au1", name: "Matrícula automática no Onboarding", trigger: "Novo colaborador no RH", action: "Inscrever na trilha Onboarding", enabled: true, runs: 312 },
  { id: "au2", name: "Lembrete de curso a vencer", trigger: "7 dias antes do prazo", action: "Enviar e-mail e push", enabled: true, runs: 1840 },
  { id: "au3", name: "Emissão de certificado", trigger: "Curso concluído", action: "Gerar certificado PDF", enabled: true, runs: 4521 },
  { id: "au4", name: "Bloqueio por inatividade", trigger: "90 dias sem acesso", action: "Inativar usuário", enabled: false, runs: 24 },
];

export const auditLogs: AuditLog[] = [
  { id: "l1", user: "ana.souza@navoxi.com", action: "Editou permissões do perfil Admin. de Unidade", module: "Identidade", ip: "10.2.31.5", timestamp: "2026-06-12 09:41:22", severity: "alerta" },
  { id: "l2", user: "bruno.ferreira@navoxi.com", action: "Publicou curso 'Segurança da Informação' (Navoxi)", module: "Aprendizagem", ip: "10.2.44.18", timestamp: "2026-06-12 08:12:03", severity: "info" },
  { id: "l3", user: "system", action: "Falha na sincronização do Webhook Certificados", module: "Integrações", ip: "—", timestamp: "2026-06-11 23:10:55", severity: "critico" },
  { id: "l4", user: "bruno.ferreira@navoxi.com", action: "Enviou comunicação para 'Navoxi'", module: "Comunicação", ip: "10.2.10.9", timestamp: "2026-06-11 14:02:40", severity: "info" },
  { id: "l5", user: "ana.souza@navoxi.com", action: "Excluiu usuário 'teste01'", module: "Administração", ip: "10.2.31.5", timestamp: "2026-06-10 16:30:11", severity: "alerta" },
  { id: "l6", user: "system", action: "5 tentativas de login malsucedidas", module: "Identidade", ip: "189.40.2.77", timestamp: "2026-06-10 02:15:00", severity: "critico" },
];

export const settings: Settings = {
  orgName: "Navoxi",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  passwordMinLength: 10,
  mfaRequired: true,
  certificateValidity: 24,
  approvalRequired: true,
  brandColor: "#2563eb",
  modules: {
    aprendizagem: true,
    repositorio: true,
    comunicacao: true,
    relatorios: true,
    administracao: true,
    sistema: true,
  },
  layout: {
    navStyle: "sidebar",
    density: "comfortable",
    showDestaques: true,
  },
};

export const scheduledJobs: ScheduledJob[] = [
  { id: "sj1", name: "Sincronização RH (SuccessFactors)", schedule: "Diário · 06:00", module: "Integrações", action: "Importar colaboradores e unidades", enabled: true, lastRun: "2026-06-12 06:00", nextRun: "2026-06-13 06:00" },
  { id: "sj2", name: "Lembretes de prazo de curso", schedule: "Diário · 08:00", module: "Aprendizagem", action: "Notificar pendentes de conclusão", enabled: true, lastRun: "2026-06-12 08:00", nextRun: "2026-06-13 08:00" },
  { id: "sj3", name: "Relatório semanal de matrículas", schedule: "Semanal · Seg 07:00", module: "Relatórios", action: "Enviar digest para gestores", enabled: true, lastRun: "2026-06-09 07:00", nextRun: "2026-06-16 07:00" },
  { id: "sj4", name: "Limpeza de sessões expiradas", schedule: "A cada 6 horas", module: "Identidade", action: "Encerrar sessões inativas", enabled: false, lastRun: "2026-06-11 18:00", nextRun: "—" },
];

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
    userId: "u4",
    title: "Prazo de conclusão — LGPD",
    message: "Você tem 7 dias para concluir o curso LGPD na Prática.",
    type: "prazo",
    read: false,
    timestamp: "Há 2 horas",
    href: "/aprendizagem/cursos",
    module: "Aprendizagem",
    details:
      "O curso LGPD na Prática é obrigatório para colaboradores da área comercial.\n\nPrazo final: 19/06/2026\nCarga horária restante: 2h\nProgresso atual: 50%\n\nAcesse o curso e conclua o módulo final para emitir seu certificado.",
  },
  {
    id: "n2",
    userId: "u4",
    title: "Nova turma disponível",
    message: "Segurança da Informação · Turma 2026.1 aberta para inscrições na Navoxi.",
    type: "curso",
    read: false,
    timestamp: "Há 5 horas",
    href: "/aprendizagem/catalogo",
    module: "Aprendizagem",
    details:
      "Turma: Segurança da Informação · Turma 2026.1\nInstrutora: Carla Mendes\nInício: 15/06/2026\nVagas: 2 restantes\nModalidade: Híbrido\n\nInscreva-se pelo catálogo de cursos antes do encerramento das vagas.",
  },
  {
    id: "n3",
    userId: "u1",
    title: "Manutenção programada",
    message: "A plataforma ficará indisponível no domingo, 14/06, das 20h às 22h.",
    type: "info",
    read: false,
    timestamp: "Ontem",
    module: "Sistema",
    details:
      "Manutenção preventiva do ambiente de produção.\n\nJanela: domingo, 14/06/2026, 20h–22h (horário de Brasília)\nImpacto: indisponibilidade total da plataforma\n\nRecomenda-se salvar trabalhos em andamento antes do horário informado.",
  },
  {
    id: "n4",
    userId: "u4",
    title: "Certificado emitido",
    message: "Seu certificado de Compliance e Código de Ética está disponível.",
    type: "curso",
    read: true,
    timestamp: "12/06",
    href: "/aprendizagem/certificados",
    module: "Aprendizagem",
    details:
      "Curso concluído: Compliance e Código de Ética\nNota final: 92%\nEmitido em: 12/06/2026\nValidade: 12/06/2027\n\nO certificado pode ser baixado em PDF na área de Certificados.",
  },
  {
    id: "n5",
    userId: "u2",
    title: "Tentativas de login detectadas",
    message: "Foram registradas tentativas de acesso não autorizadas na sua conta.",
    type: "alerta",
    read: true,
    timestamp: "10/06",
    module: "Identidade",
    details:
      "Foram detectadas 3 tentativas de login malsucedidas em 10/06/2026 entre 22h e 22h15.\n\nOrigem: IP externo não reconhecido\nAção recomendada: revise sua senha e verifique sessões ativas em Identidade & Acesso.",
  },
  {
    id: "n6",
    userId: "u2",
    title: "Solicitação de matrícula pendente",
    message: "Diego Alves solicitou matrícula em Segurança da Informação e Dados.",
    type: "info",
    read: false,
    timestamp: "Há 1 hora",
    href: "/aprendizagem/solicitacoes?status=pendente",
    module: "Aprendizagem",
    details:
      "Solicitante: Diego Alves (Navoxi)\nCurso: Segurança da Informação e Dados\nTurma: Segurança da Informação · Turma 2026.1\nSolicitado em: 12/06/2026 às 09:15\n\nAprove ou rejeite a solicitação na área de Solicitações de Matrícula.",
  },
  {
    id: "n7",
    userId: "u8",
    title: "Turma iniciada",
    message: "A turma Liderança · Junho entrou em andamento.",
    type: "curso",
    read: false,
    timestamp: "Hoje",
    href: "/aprendizagem/turmas",
    module: "Aprendizagem",
    details:
      "Turma: Liderança · Junho\nInstrutor: Henrique Castro\nPeríodo: 02/06 a 30/06/2026\nAlunos matriculados: 25\n\nConsulte o calendário de aulas e materiais na gestão de turmas.",
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
