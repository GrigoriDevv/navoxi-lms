"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { Destaque, AlertRule, Message, Post, UnitId } from "@/lib/types";

type Tab = "destaques" | "posts" | "notificacoes" | "alertas" | "correio" | "campanhas";

const channelMeta: Record<string, { label: string; color: "green" | "blue" | "purple" | "amber" }> = {
  email: { label: "E-mail", color: "blue" },
  push: { label: "Push", color: "green" },
  mural: { label: "Mural", color: "purple" },
  sms: { label: "SMS", color: "amber" },
  sistema: { label: "Sistema", color: "blue" },
};

const statusColor = { enviado: "green", agendado: "blue", rascunho: "slate", publicado: "green" } as const;

export default function ComunicacaoPage() {
  const {
    messages,
    posts,
    notifications,
    addPost,
    updatePost,
    addDestaque,
    updateDestaque,
    addAlertRule,
    toggleAlertRule,
    sendInternalMail,
    markMailRead,
    addMessage,
    dispatchNotification,
  } = useApp();
  const { destaques, alertRules, internalMails, users, currentUser, unitId } = useAuthScope();

  const [tab, setTab] = useState<Tab>("destaques");
  const [modal, setModal] = useState<string | null>(null);

  const [destaqueForm, setDestaqueForm] = useState({ title: "", body: "", unitId: (unitId ?? "holding") as UnitId, visible: true, pinned: false });
  const [postForm, setPostForm] = useState({ title: "", body: "", unitId: (unitId ?? "holding") as UnitId });
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" as const });
  const [alertForm, setAlertForm] = useState({ name: "", criteria: "", channel: "sistema" as AlertRule["channel"], audience: "Todos", unitId: (unitId ?? "holding") as UnitId, enabled: true });
  const [mailForm, setMailForm] = useState({ toUserId: "", subject: "", body: "", unitId: (unitId ?? "holding") as UnitId });
  const [campForm, setCampForm] = useState({ title: "", channel: "email" as Message["channel"], audience: "Todos", status: "rascunho" as Message["status"], sentAt: "—", openRate: 0 });

  const tabs: { id: Tab; label: string }[] = [
    { id: "destaques", label: "Destaques" },
    { id: "posts", label: "Posts" },
    { id: "notificacoes", label: "Notificações" },
    { id: "alertas", label: "Alertas" },
    { id: "correio", label: "Correio interno" },
    { id: "campanhas", label: "Campanhas" },
  ];

  const myMails = internalMails.filter(
    (m) => m.toUserId === currentUser?.id || m.fromUserId === currentUser?.id
  );

  return (
    <div>
      <PageHeader title="Comunicação" subtitle="Destaques, notificações, alertas, correio interno e posts (RF-056 a RF-060)" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Destaques ativos" value={destaques.filter((d) => d.visible).length.toString()} icon={<Icon name="bell" className="w-5 h-5" />} />
        <StatCard label="Notificações" value={notifications.length.toString()} color="#2563eb" icon={<Icon name="mail" className="w-5 h-5" />} />
        <StatCard label="Alertas ativos" value={alertRules.filter((a) => a.enabled).length.toString()} color="#d97706" icon={<Icon name="list" className="w-5 h-5" />} />
        <StatCard label="Correio" value={myMails.filter((m) => !m.read && m.toUserId === currentUser?.id).length.toString()} color="#7c3aed" icon={<Icon name="user" className="w-5 h-5" />} />
      </div>

      <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "destaques" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("destaque")}><Icon name="plus" className="w-4 h-4" />Novo destaque</Button>
          </div>
          <div className="space-y-3">
            {destaques.map((d) => (
              <Card key={d.id} className={`p-4 ${d.pinned ? "border-brand/30 bg-emerald-50/50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-800">{d.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{d.body}</p>
                    <p className="text-xs text-slate-400 mt-2">{unitLabels[d.unitId]} · {d.publishedAt}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {d.pinned && <Badge color="green">Fixado</Badge>}
                    <Badge color={d.visible ? "green" : "slate"}>{d.visible ? "Visível" : "Oculto"}</Badge>
                    <button onClick={() => updateDestaque(d.id, { visible: !d.visible })} className="text-xs text-brand hover:underline">
                      {d.visible ? "Ocultar" : "Exibir"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "posts" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("post")}><Icon name="plus" className="w-4 h-4" />Novo post</Button>
          </div>
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-slate-800">{p.title}</h4>
                  <Badge color={statusColor[p.status]}>{p.status}</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{p.body}</p>
                <p className="text-xs text-slate-400 mt-2">{p.author} · {unitLabels[p.unitId]} · {p.publishedAt}</p>
                {p.status === "rascunho" && (
                  <button onClick={() => updatePost(p.id, { status: "publicado", publishedAt: new Date().toLocaleString("pt-BR") })} className="text-xs text-brand mt-2 hover:underline">
                    Publicar
                  </button>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "notificacoes" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("notif")}><Icon name="plus" className="w-4 h-4" />Disparar notificação</Button>
          </div>
          <Card className="p-2">
            <Table head={["Título", "Mensagem", "Tipo", "Lida", "Quando"]}>
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{n.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{n.message}</td>
                  <td className="px-4 py-3"><Badge color="blue">{n.type}</Badge></td>
                  <td className="px-4 py-3"><Badge color={n.read ? "slate" : "green"}>{n.read ? "Sim" : "Não"}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{n.timestamp}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === "alertas" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("alert")}><Icon name="plus" className="w-4 h-4" />Nova regra</Button>
          </div>
          <Card className="p-2">
            <Table head={["Alerta", "Critério", "Canal", "Público", "Status", "Último disparo", "Ações"]}>
              {alertRules.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.criteria}</td>
                  <td className="px-4 py-3"><Badge color={channelMeta[a.channel].color}>{channelMeta[a.channel].label}</Badge></td>
                  <td className="px-4 py-3 text-sm">{a.audience}</td>
                  <td className="px-4 py-3"><Badge color={a.enabled ? "green" : "slate"}>{a.enabled ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{a.lastTriggered ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAlertRule(a.id)} className="text-xs text-brand hover:underline">
                      {a.enabled ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === "correio" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("mail")}><Icon name="plus" className="w-4 h-4" />Nova mensagem</Button>
          </div>
          <Card className="p-2">
            <Table head={["De", "Para", "Assunto", "Data", "Status"]}>
              {myMails.map((m) => (
                <tr key={m.id} className={`hover:bg-slate-50 ${!m.read && m.toUserId === currentUser?.id ? "bg-blue-50/50" : ""}`}>
                  <td className="px-4 py-3">{m.fromName}</td>
                  <td className="px-4 py-3">{m.toName}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => markMailRead(m.id)} className="text-sm font-medium text-slate-800 hover:text-brand text-left">
                      {m.subject}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{m.body}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{m.sentAt}</td>
                  <td className="px-4 py-3"><Badge color={m.read ? "slate" : "blue"}>{m.read ? "Lida" : "Não lida"}</Badge></td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === "campanhas" && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModal("camp")}><Icon name="plus" className="w-4 h-4" />Nova campanha</Button>
          </div>
          <Card className="p-2">
            <Table head={["Campanha", "Canal", "Público", "Status", "Envio", "Abertura"]}>
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
                  <td className="px-4 py-3"><Badge color={channelMeta[m.channel].color}>{channelMeta[m.channel].label}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{m.audience}</td>
                  <td className="px-4 py-3"><Badge color={statusColor[m.status]}>{m.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{m.sentAt}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{m.openRate ? `${m.openRate}%` : "—"}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}

      <Modal open={modal === "destaque"} onClose={() => setModal(null)} title="Publicar destaque">
        <form onSubmit={(e) => { e.preventDefault(); addDestaque(destaqueForm); setModal(null); }}>
          <Field label="Título"><input required className={inputClass} value={destaqueForm.title} onChange={(e) => setDestaqueForm({ ...destaqueForm, title: e.target.value })} /></Field>
          <Field label="Texto"><textarea required className={inputClass} rows={3} value={destaqueForm.body} onChange={(e) => setDestaqueForm({ ...destaqueForm, body: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" checked={destaqueForm.pinned} onChange={(e) => setDestaqueForm({ ...destaqueForm, pinned: e.target.checked })} />Fixar no topo</label>
          <Button type="submit">Publicar</Button>
        </form>
      </Modal>

      <Modal open={modal === "post"} onClose={() => setModal(null)} title="Novo post">
        <form onSubmit={(e) => { e.preventDefault(); addPost(postForm); setModal(null); }}>
          <Field label="Título"><input required className={inputClass} value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></Field>
          <Field label="Conteúdo"><textarea required className={inputClass} rows={3} value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} /></Field>
          <Button type="submit">Publicar</Button>
        </form>
      </Modal>

      <Modal open={modal === "notif"} onClose={() => setModal(null)} title="Disparar notificação">
        <form onSubmit={(e) => { e.preventDefault(); dispatchNotification(notifForm); setModal(null); }}>
          <Field label="Título"><input required className={inputClass} value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} /></Field>
          <Field label="Mensagem"><textarea required className={inputClass} rows={2} value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} /></Field>
          <Button type="submit">Disparar</Button>
        </form>
      </Modal>

      <Modal open={modal === "alert"} onClose={() => setModal(null)} title="Nova regra de alerta">
        <form onSubmit={(e) => { e.preventDefault(); addAlertRule(alertForm); setModal(null); }}>
          <Field label="Nome"><input required className={inputClass} value={alertForm.name} onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })} /></Field>
          <Field label="Critério"><input required className={inputClass} value={alertForm.criteria} onChange={(e) => setAlertForm({ ...alertForm, criteria: e.target.value })} /></Field>
          <Field label="Público"><input className={inputClass} value={alertForm.audience} onChange={(e) => setAlertForm({ ...alertForm, audience: e.target.value })} /></Field>
          <Button type="submit">Salvar regra</Button>
        </form>
      </Modal>

      <Modal open={modal === "mail"} onClose={() => setModal(null)} title="Nova mensagem interna">
        <form onSubmit={(e) => {
          e.preventDefault();
          const to = users.find((u) => u.id === mailForm.toUserId);
          if (!to) return;
          sendInternalMail({ toUserId: to.id, toName: to.name, subject: mailForm.subject, body: mailForm.body, unitId: mailForm.unitId });
          setModal(null);
        }}>
          <Field label="Destinatário">
            <select required className={inputClass} value={mailForm.toUserId} onChange={(e) => setMailForm({ ...mailForm, toUserId: e.target.value })}>
              <option value="">Selecione…</option>
              {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Assunto"><input required className={inputClass} value={mailForm.subject} onChange={(e) => setMailForm({ ...mailForm, subject: e.target.value })} /></Field>
          <Field label="Mensagem"><textarea required className={inputClass} rows={3} value={mailForm.body} onChange={(e) => setMailForm({ ...mailForm, body: e.target.value })} /></Field>
          <Button type="submit">Enviar</Button>
        </form>
      </Modal>

      <Modal open={modal === "camp"} onClose={() => setModal(null)} title="Nova campanha">
        <form onSubmit={(e) => { e.preventDefault(); addMessage(campForm); setModal(null); }}>
          <Field label="Título"><input required className={inputClass} value={campForm.title} onChange={(e) => setCampForm({ ...campForm, title: e.target.value })} /></Field>
          <Field label="Público"><input className={inputClass} value={campForm.audience} onChange={(e) => setCampForm({ ...campForm, audience: e.target.value })} /></Field>
          <Button type="submit">Criar campanha</Button>
        </form>
      </Modal>
    </div>
  );
}
