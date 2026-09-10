import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  get siteUrl() {
    return optional('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
  },
  get cronSecret() {
    return required('CRON_SECRET');
  },
  get resendApiKey() {
    return required('RESEND_API_KEY');
  },
  get emailFrom() {
    return required('EMAIL_FROM');
  },
  get adminNotificationEmail() {
    return required('ADMIN_NOTIFICATION_EMAIL');
  },
  get stripeSecretKey() {
    return required('STRIPE_SECRET_KEY');
  },
  get stripeWebhookSecret() {
    return required('STRIPE_WEBHOOK_SECRET');
  },
  get stripePriceId() {
    return required('STRIPE_PRICE_ID');
  },
  get stripeApiBase() {
    return process.env.STRIPE_API_BASE || undefined;
  },
  get deepseekApiKey() {
    return required('DEEPSEEK_API_KEY');
  },
  get deepseekModel() {
    return optional('DEEPSEEK_MODEL', 'deepseek-v4-flash');
  },
  get deepseekBaseUrl() {
    return optional('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
  },
  get aiSummarizationEnabled() {
    return process.env.AI_SUMMARIZATION_ENABLED === 'true';
  },
  get aiDailyCostLimitUsd() {
    return Number(optional('AI_DAILY_COST_LIMIT_USD', '1'));
  },
  get autoSendDelayHours() {
    return Number(optional('AUTO_SEND_DELAY_HOURS', '5'));
  },
  get googleOAuthEnabled() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  },
};
