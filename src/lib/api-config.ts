/** Feature flag: quando true, cursos/aulas/progresso vêm do backend Java. */
export function useJavaApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_JAVA_API === "true";
}

export function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
}
