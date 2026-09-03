"use client";

import { Badge, Card } from "@/components/ui";
import { unitLabels } from "@/lib/rbac";
import { useAuthScope } from "@/lib/use-auth-scope";

export function PostsMural() {
  const { posts } = useAuthScope();
  const publishedPosts = posts.filter((post) => post.status === "publicado");

  if (publishedPosts.length === 0) return null;

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-800">Mural de comunicação</h3>
        <Badge color="blue">{publishedPosts.length}</Badge>
      </div>
      <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
        {publishedPosts.map((post) => (
          <article key={post.id} className="p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800">{post.title}</h4>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{post.body}</p>
            <p className="text-xs text-slate-400 mt-2">
              {post.author} · {unitLabels[post.unitId]} · {post.publishedAt}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}
