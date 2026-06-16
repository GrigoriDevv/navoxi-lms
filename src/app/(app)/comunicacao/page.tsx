"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { AlertRule, Message, UnitId } from "@/lib/types";

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

  const [modal, setModal] = useState<"destaque" | "post" | "notif" | "alert" | "mail" | "camp" | null>(null);
  const [destaqueForm, setDestaqueForm] = useState({ title: "", body: "", unitId: (unitId ?? "matriz") as UnitId, visible: true, pinned: false });
  const [postForm, setPostForm] = useState({ title: "", body: "", unitId: (unitId ?? "matriz") as UnitId });
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" as const, userId: "" });
  const [alertForm, setAlertForm] = useState({ name: "", criteria: "", channel: "sistema" as AlertRule["channel"], audience: "Todos", unitId: (unitId ?? "matriz") as UnitId, enabled: true });
  const [mailForm, setMailForm] = useState({ toUserId: "", subject: "", body: "", unitId: (unitId ?? "matriz") as UnitId });
  const [campForm, setCampForm] = useState({ title: "", channel: "email" as Message["channel"], audience: "Todos", status: "rascunho" as Message["status"], sentAt: "—", openRate: 0 });

  const enviadas = messages.filter((m) => m.status === "enviado");
  const avgOpen = Math.round(enviadas.reduce((s, m) => s + m.openRate, 0) / (enviadas.length || 1));
  const myMails = internalMails.filter((m) => m.toUserId === currentUser?.id || m.fromUserId === currentUser?.id);

  return (
    <div>
      <PageHeader
        title="Comunicação"
        subtitle="Campanhas, posts no mural e notificações multicanal"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Campanhas" value={messages.length.toString()} icon={<Icon name="mail" className="w-5 h-5" />} />
        <StatCard label="Posts no mural" value={posts.length.toString()} icon={<Icon name="grid" className="w-5 h-5" />} color="#2563eb" />
        <StatCard label="Taxa de abertura" value={`${avgOpen}%`} icon={<Icon name="trend" className="w-5 h-5" />} color="#7c3aed" />
        <StatCard label="Notificações" value={notifications.filter((n) => !n.read).length.toString()} icon={<Icon name="bell" className="w-5 h-5" />} color="#d97706" />
      </div>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Destaques e avisos</h3>
          <Button onClick={() => setModal("destaque")}><Icon name="plus" className="w-4 h-4" />Novo</Button>
        </div>
        <div className="space-y-3">
          {destaques.map((d) => (
            <div key={d.id} className="p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-slate-800">{d.title}</h4>
                <div className="flex gap-2 items-center">
                  {d.pinned && <Badge color="green">Destaque</Badge>}
                  <Badge color={d.visible ? "green" : "slate"}>{d.visible ? "Visível" : "Oculto"}</Badge>
                  <button onClick={() => updateDestaque(d.id, { visible: !d.visible })} className="text-xs text-brand hover:underline">
                    {d.visible ? "Ocultar" : "Exibir"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{d.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Posts publicados (mural)</h3>
          <Button onClick={() => setModal("post")}><Icon name="plus" className="w-4 h-4" />Novo post</Button>
        </div>
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-slate-800">{p.title}</h4>
                <Badge color={statusColor[p.status]}>{p.status}</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">{p.body}</p>
              <p className="text-xs text-slate-400 mt-2">{p.author} · {unitLabels[p.unitId]} · {p.publishedAt}</p>
              {p.status === "rascunho" && (
                <button onClick={() => updatePost(p.id, { status: "publicado", publishedAt: new Date().toLocaleString("pt-BR") })} className="text-xs text-brand mt-2 hover:underline">Publicar</button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Notificações sistêmicas</h3>
            <Button onClick={() => { setNotifForm({ title: "", message: "", type: "info", userId: currentUser?.id ?? "" }); setModal("notif"); }}><Icon name="plus" className="w-4 h-4" />Disparar</Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="text-sm py-2 border-b border-slate-100 last:border-0">
                <div className="font-medium text-slate-800">{n.title}</div>
                <div className="text-xs text-slate-500">{n.message}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Correio interno</h3>
            <Button onClick={() => setModal("mail")}><Icon name="plus" className="w-4 h-4" />Nova mensagem</Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {myMails.slice(0, 5).map((m) => (
              <button key={m.id} onClick={() => markMailRead(m.id)} className={`w-full text-left text-sm py-2 border-b border-slate-100 last:border-0 ${!m.read && m.toUserId === currentUser?.id ? "font-medium" : ""}`}>
                <div className="text-slate-800">{m.subject}</div>
                <div className="text-xs text-slate-500">{m.fromName} → {m.toName}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Regras de alerta</h3>
          <Button onClick={() => setModal("alert")}><Icon name="plus" className="w-4 h-4" />Nova regra</Button>
        </div>
        <div className="space-y-3">
          {alertRules.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <div className="font-medium text-slate-800 text-sm">{a.name}</div>
                <div className="text-xs text-slate-400">{a.criteria} · {a.audience}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={a.enabled ? "green" : "slate"}>{a.enabled ? "Ativo" : "Inativo"}</Badge>
                <button onClick={() => toggleAlertRule(a.id)} className="text-xs text-brand hover:underline">Alternar</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-2">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Campanhas multicanal</h3>
          <Button onClick={() => setModal("camp")}><Icon name="plus" className="w-4 h-4" />Nova campanha</Button>
        </div>
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

      <Modal open={modal === "destaque"} onClose={() => setModal(null)} title="Publicar destaque">
        <form onSubmit={(e) => { e.preventDefault(); addDestaque(destaqueForm); setModal(null); }}>
          <Field label="Título"><input required className={inputClass} value={destaqueForm.title} onChange={(e) => setDestaqueForm({ ...destaqueForm, title: e.target.value })} /></Field>
          <Field label="Texto"><textarea required className={inputClass} rows={3} value={destaqueForm.body} onChange={(e) => setDestaqueForm({ ...destaqueForm, body: e.target.value })} /></Field>
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
          <Field label="Destinatário">
            <select required className={inputClass} value={notifForm.userId} onChange={(e) => setNotifForm({ ...notifForm, userId: e.target.value })}>
              <option value="">Selecione…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Título"><input required className={inputClass} value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} /></Field>
          <Field label="Mensagem"><textarea required className={inputClass} rows={2} value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} /></Field>
          <Button type="submit">Disparar</Button>
        </form>
      </Modal>
      <Modal open={modal === "alert"} onClose={() => setModal(null)} title="Nova regra de alerta">
        <form onSubmit={(e) => { e.preventDefault(); addAlertRule(alertForm); setModal(null); }}>
          <Field label="Nome"><input required className={inputClass} value={alertForm.name} onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })} /></Field>
          <Field label="Critério"><input required className={inputClass} value={alertForm.criteria} onChange={(e) => setAlertForm({ ...alertForm, criteria: e.target.value })} /></Field>
          <Button type="submit">Salvar</Button>
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
          <Button type="submit">Criar</Button>
        </form>
      </Modal>
    </div>
  );
}
