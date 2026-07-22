/** Client-facing auth error that preserves HTTP status (e.g. 429 rate limit). */
export class AuthLoginError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthLoginError";
  }
}

export const LOGIN_RATE_LIMIT_MESSAGE =
  "Muitas tentativas de login. Aguarde e tente novamente.";

/** Default backoff aligned with LMS_LOGIN_RATE_LIMIT_WINDOW_SECONDS. */
export const LOGIN_RATE_LIMIT_BACKOFF_SECONDS = 60;
