"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { ApiError, lmsApi } from "@/lib/api-client";
import type { Certificado } from "@/lib/types";

const statusLabel: Record<Certificado["status"], string> = {
  valido: "Válido",
  expirado: "Expirado",
  revogado: "Revogado",
};

export default function VerificarCertificadoPage() {
  const params = useParams<{ hash: string }>();
  const hash = params.hash;
  const [cert, setCert] = useState<Certificado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await lmsApi.verifyCertificate(hash);
        if (cancelled) return;
        setCert(data);
        const pageUrl =
          typeof window !== "undefined"
            ? window.location.href
            : `/certificados/verificar/${hash}`;
        const qr = await QRCode.toDataURL(pageUrl, { width: 180, margin: 1 });
        if (!cancelled) setQrDataUrl(qr);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Não foi possível validar o certificado"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await lmsApi.downloadCertificatePdfByHash(hash);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${hash}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao baixar PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">
            N
          </div>
          <div>
            <p className="text-sm font-semibold">Navoxi LMS</p>
            <p className="text-xs text-slate-500">Verificação pública de certificado</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {loading && <p className="text-slate-500 text-sm">Validando certificado…</p>}
        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {cert && !loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1 space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                  Status
                </p>
                <p className="text-lg font-semibold">{statusLabel[cert.status]}</p>
                <div>
                  <p className="text-xs text-slate-400">Aluno</p>
                  <p className="font-medium">{cert.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Curso</p>
                  <p className="font-medium">{cert.courseTitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Emitido em</p>
                    <p>{cert.issuedAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Válido até</p>
                    <p>{cert.expiresAt}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 break-all">
                  Código: {cert.validationHash ?? hash}
                </p>
                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={downloading}
                  className="mt-2 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {downloading ? "Baixando…" : "Baixar PDF"}
                </button>
              </div>
              {qrDataUrl && (
                <div className="shrink-0 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="QR Code de verificação"
                    className="mx-auto rounded border border-slate-200"
                    width={180}
                    height={180}
                  />
                  <p className="mt-2 text-xs text-slate-500">Escaneie para revalidar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
