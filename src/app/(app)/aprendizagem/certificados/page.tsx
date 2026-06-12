"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useAuthScope } from "@/lib/use-auth-scope";
import { unitLabels } from "@/lib/rbac";
import { PageHeader, Card, Badge, Table, StatCard, Modal, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";

const statusColor = { valido: "green", expirado: "red", revogado: "slate" } as const;

export default function CertificadosPage() {
  const { updateCertificado } = useApp();
  const { certificados, can } = useAuthScope();
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<(typeof certificados)[0] | null>(null);

  const filtered = certificados.filter(
    (c) =>
      !query ||
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      c.userName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Certificados"
        subtitle="Consulta e controle de usuários certificados (RF-046)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total" value={certificados.length.toString()} icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Válidos" value={certificados.filter((c) => c.status === "valido").length.toString()} color="#00a14b" icon={<Icon name="check" className="w-5 h-5" />} />
        <StatCard label="Expirados" value={certificados.filter((c) => c.status === "expirado").length.toString()} color="#dc2626" icon={<Icon name="bell" className="w-5 h-5" />} />
        <StatCard label="Revogados" value={certificados.filter((c) => c.status === "revogado").length.toString()} icon={<Icon name="shield" className="w-5 h-5" />} color="#64748b" />
      </div>

      <Card className="p-4 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código ou nome do usuário…"
          className="w-full px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
        />
      </Card>

      <Card className="p-2">
        <Table head={["Código", "Usuário", "Curso", "Emissão", "Validade", "Status", "Ações"]}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs">{c.id.toUpperCase()}</td>
              <td className="px-4 py-3">{c.userName}</td>
              <td className="px-4 py-3 text-sm">{c.courseTitle}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.issuedAt).toLocaleDateString("pt-BR")}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{new Date(c.expiresAt).toLocaleDateString("pt-BR")}</td>
              <td className="px-4 py-3"><Badge color={statusColor[c.status]}>{c.status}</Badge></td>
              <td className="px-4 py-3">
                <button onClick={() => setDetail(c)} className="text-xs text-brand font-medium hover:underline">Detalhes</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Certificado">
        {detail && (
          <div className="space-y-3 text-sm">
            <p><strong>Código:</strong> {detail.id.toUpperCase()}</p>
            <p><strong>Usuário:</strong> {detail.userName}</p>
            <p><strong>Curso:</strong> {detail.courseTitle}</p>
            <p><strong>Unidade:</strong> {unitLabels[detail.unitId]}</p>
            {can("manage_courses") && detail.status === "valido" && (
              <Button
                variant="outline"
                onClick={() => {
                  updateCertificado(detail.id, "revogado");
                  setDetail(null);
                }}
              >
                Revogar certificado
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
