CREATE TABLE permissions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE permission_roles (
  permission_id VARCHAR(36) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL,
  sort_order INT NOT NULL,
  PRIMARY KEY (permission_id, sort_order)
);

CREATE TABLE scheduled_jobs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  schedule VARCHAR(128) NOT NULL,
  module VARCHAR(128) NOT NULL,
  action VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_run VARCHAR(64),
  next_run VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_permission_roles_perm ON permission_roles(permission_id);

-- Seed config matrix (aligned with FE mock-data)
INSERT INTO permissions (id, name, description, created_at, updated_at) VALUES
  ('p1', 'Gerenciar usuários (todas unidades)', 'Criar, editar e remover usuários em qualquer unidade', NOW(), NOW()),
  ('p2', 'Gerenciar usuários (unidade)', 'Criar, editar e remover usuários da própria unidade', NOW(), NOW()),
  ('p3', 'Configurações globais', 'Parâmetros, identidade visual e regras de negócio', NOW(), NOW()),
  ('p4', 'Publicar cursos', 'Publicar e arquivar cursos', NOW(), NOW()),
  ('p5', 'Gerenciar turmas', 'Criar e gerenciar turmas', NOW(), NOW()),
  ('p6', 'Relatórios (todas unidades)', 'Dashboards e analytics corporativos', NOW(), NOW()),
  ('p7', 'Relatórios (unidade)', 'Dashboards e analytics da unidade', NOW(), NOW()),
  ('p8', 'Gerenciar repositório', 'Upload e gestão de conteúdos', NOW(), NOW()),
  ('p9', 'Disparar comunicações', 'Enviar campanhas e avisos', NOW(), NOW()),
  ('p10', 'Configurar integrações', 'Gerenciar SSO, RH e APIs', NOW(), NOW()),
  ('p11', 'Consultar auditoria', 'Acessar logs e trilhas de auditoria', NOW(), NOW()),
  ('p12', 'Realizar cursos', 'Inscrever-se e concluir cursos', NOW(), NOW()),
  ('p13', 'Publicar aulas em vídeo', 'Publicar vídeos-aula nos cursos do instrutor', NOW(), NOW());

INSERT INTO permission_roles (permission_id, role, sort_order) VALUES
  ('p1', 'admin_premium', 0),
  ('p2', 'admin_unidade', 0),
  ('p3', 'admin_premium', 0),
  ('p4', 'admin_premium', 0),
  ('p4', 'admin_unidade', 1),
  ('p4', 'gestor_conteudo', 2),
  ('p4', 'instrutor', 3),
  ('p5', 'admin_premium', 0),
  ('p5', 'admin_unidade', 1),
  ('p5', 'instrutor', 2),
  ('p6', 'admin_premium', 0),
  ('p7', 'admin_unidade', 0),
  ('p8', 'admin_premium', 0),
  ('p8', 'admin_unidade', 1),
  ('p8', 'gestor_conteudo', 2),
  ('p9', 'admin_premium', 0),
  ('p9', 'admin_unidade', 1),
  ('p10', 'admin_premium', 0),
  ('p11', 'admin_premium', 0),
  ('p12', 'admin_premium', 0),
  ('p12', 'admin_unidade', 1),
  ('p12', 'gestor_conteudo', 2),
  ('p12', 'instrutor', 3),
  ('p12', 'aluno', 4),
  ('p13', 'instrutor', 0);

INSERT INTO scheduled_jobs (id, name, schedule, module, action, enabled, last_run, next_run, created_at, updated_at) VALUES
  ('sj1', 'Sincronização RH (SuccessFactors)', 'Diário · 06:00', 'Integrações', 'Importar colaboradores e unidades', TRUE, '2026-06-12 06:00', '2026-06-13 06:00', NOW(), NOW()),
  ('sj2', 'Lembretes de prazo de curso', 'Diário · 08:00', 'Aprendizagem', 'Notificar pendentes de conclusão', TRUE, '2026-06-12 08:00', '2026-06-13 08:00', NOW(), NOW()),
  ('sj3', 'Relatório semanal de matrículas', 'Semanal · Seg 07:00', 'Relatórios', 'Enviar digest para gestores', TRUE, '2026-06-09 07:00', '2026-06-16 07:00', NOW(), NOW()),
  ('sj4', 'Limpeza de sessões expiradas', 'A cada 6 horas', 'Identidade', 'Encerrar sessões inativas', FALSE, '2026-06-11 18:00', NULL, NOW(), NOW());
