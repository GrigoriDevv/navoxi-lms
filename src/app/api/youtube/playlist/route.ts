import { NextRequest, NextResponse } from "next/server";

export interface PlaylistVideoItem {
  videoId: string;
  position: number;
  thumbnailUrl?: string;
  durationSec?: number;
}

function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^PL[\w-]{10,}$/.test(trimmed) || /^UU[\w-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get("list");
    if (listParam) return listParam;

    const pathMatch = url.pathname.match(/\/playlist(?:\/|$)/);
    if (pathMatch && listParam) return listParam;
  } catch {
    // not a URL
  }

  return null;
}

function parseDuration(iso?: string): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY não configurada. Adicione a chave em .env.local." },
      { status: 503 }
    );
  }

  const raw = request.nextUrl.searchParams.get("playlistId") ?? request.nextUrl.searchParams.get("url") ?? "";
  const playlistId = parsePlaylistId(raw);

  if (!playlistId) {
    return NextResponse.json(
      { error: "Informe um ID ou URL válida de playlist do YouTube." },
      { status: 400 }
    );
  }

  const items: PlaylistVideoItem[] = [];
  let pageToken: string | undefined;

  try {
    do {
      const params = new URLSearchParams({
        part: "snippet,contentDetails",
        playlistId,
        maxResults: "50",
        key: apiKey,
      });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const reason = body?.error?.message ?? res.statusText;
        const status = res.status === 403 ? 403 : res.status === 404 ? 404 : 502;
        return NextResponse.json(
          { error: `Falha ao consultar playlist: ${reason}` },
          { status }
        );
      }

      const data = (await res.json()) as {
        nextPageToken?: string;
        items?: Array<{
          snippet?: {
            position?: number;
            resourceId?: { videoId?: string };
            thumbnails?: { medium?: { url?: string } };
          };
          contentDetails?: { videoId?: string; videoPublishedAt?: string };
        }>;
      };

      for (const item of data.items ?? []) {
        const videoId =
          item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
        if (!videoId) continue;

        items.push({
          videoId,
          position: item.snippet?.position ?? items.length,
          thumbnailUrl: item.snippet?.thumbnails?.medium?.url,
        });
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Playlist vazia ou inacessível." },
        { status: 404 }
      );
    }

    const videoIds = items.map((i) => i.videoId).join(",");
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (videosRes.ok) {
      const videosData = (await videosRes.json()) as {
        items?: Array<{ id?: string; contentDetails?: { duration?: string } }>;
      };
      const durationMap = new Map<string, number>();
      for (const v of videosData.items ?? []) {
        if (v.id) {
          const sec = parseDuration(v.contentDetails?.duration);
          if (sec !== undefined) durationMap.set(v.id, sec);
        }
      }
      for (const item of items) {
        const sec = durationMap.get(item.videoId);
        if (sec !== undefined) item.durationSec = sec;
      }
    }

    items.sort((a, b) => a.position - b.position);

    return NextResponse.json({ playlistId, items });
  } catch {
    return NextResponse.json(
      { error: "Erro ao comunicar com a YouTube Data API." },
      { status: 502 }
    );
  }
}
