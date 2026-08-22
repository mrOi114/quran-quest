/**
 * Redacted inspect of Auth email-related settings.
 * Never prints API keys, SMTP passwords, or access tokens.
 * Does not send signup, verification, resend, or password-reset emails.
 *
 * Public GoTrue settings use EXPO_PUBLIC_* from .env.
 * Hosted SMTP / Site URL / redirect allow-list / templates require
 * SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens).
 *
 * Run: node ./scripts/inspect-auth-email-config.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'wgyxhcdvqqdcthoeulzn';
const EXPECTED_URL = `https://${PROJECT_REF}.supabase.co`;
const EXPECTED_WEB_CALLBACK = 'https://quran-quest-5640.vercel.app/callback';
const EXPECTED_NATIVE_CALLBACK = 'quranfamily://auth/callback';

const SECRET_KEY_RE =
  /(pass|password|secret|token|key|authorization|apikey|smtp_pass|anon)/i;

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function present(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasPlaceholder(value, needles) {
  const lower = String(value || '').toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function isRedactedEnvValue(value) {
  return !present(value) || /^\[SENSITIVE\]$/i.test(value.trim());
}

function templateHas(content, snippet) {
  return typeof content === 'string' && content.includes(snippet);
}

function redactAuthConfig(config) {
  const smtpHost = config.smtp_host || null;
  const smtpUser = config.smtp_user || null;
  const customSmtp =
    present(smtpHost) && smtpHost !== 'smtp.supabase.co' && !String(smtpHost).includes('inbucket');

  return {
    site_url: config.site_url ?? null,
    uri_allow_list: config.uri_allow_list ?? null,
    external_email_enabled: config.external_email_enabled ?? null,
    mailer_autoconfirm: config.mailer_autoconfirm ?? null,
    mailer_secure_email_change_enabled: config.mailer_secure_email_change_enabled ?? null,
    mailer_otp_exp: config.mailer_otp_exp ?? null,
    mailer_otp_length: config.mailer_otp_length ?? null,
    smtp_configured: customSmtp,
    smtp_host: smtpHost,
    smtp_port: config.smtp_port ?? null,
    smtp_user: smtpUser,
    smtp_admin_email: config.smtp_admin_email ?? null,
    smtp_sender_name: config.smtp_sender_name ?? null,
    smtp_pass_set: present(config.smtp_pass),
    confirmation_has_token: templateHas(config.mailer_templates_confirmation_content, '{{ .Token }}'),
    confirmation_has_url: templateHas(
      config.mailer_templates_confirmation_content,
      '{{ .ConfirmationURL }}',
    ),
    recovery_has_token: templateHas(config.mailer_templates_recovery_content, '{{ .Token }}'),
    recovery_has_url: templateHas(config.mailer_templates_recovery_content, '{{ .ConfirmationURL }}'),
    confirmation_subject: config.mailer_subjects_confirmation ?? null,
    recovery_subject: config.mailer_subjects_recovery ?? null,
    allow_list_has_web_callback:
      typeof config.uri_allow_list === 'string' && config.uri_allow_list.includes(EXPECTED_WEB_CALLBACK),
    allow_list_has_native_callback:
      typeof config.uri_allow_list === 'string' &&
      config.uri_allow_list.includes(EXPECTED_NATIVE_CALLBACK),
  };
}

function assertNoSecrets(obj, path = '') {
  if (obj == null || typeof obj !== 'object') {
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    const next = path ? `${path}.${key}` : key;
    if (SECRET_KEY_RE.test(key) && typeof value === 'string' && value.length > 8) {
      throw new Error(`Refusing to print possible secret at ${next}`);
    }
    if (value && typeof value === 'object') {
      assertNoSecrets(value, next);
    }
  }
}

const localEnv = {
  ...loadEnvFile(join(ROOT, '.env')),
  ...process.env,
};
const vercelEnv = loadEnvFile(join(ROOT, '.tmp-inspect', 'vercel-prod.env'));

const supabaseUrl = localEnv.EXPO_PUBLIC_SUPABASE_URL || '';
const anonKey = localEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const accessToken = localEnv.SUPABASE_ACCESS_TOKEN || '';

const report = {
  project_ref: PROJECT_REF,
  local_env: {
    supabase_url: supabaseUrl || null,
    supabase_url_matches_project: supabaseUrl === EXPECTED_URL,
    anon_key_present: present(anonKey),
    anon_key_looks_placeholder: hasPlaceholder(anonKey, ['your-anon-key', 'your-anon']),
    management_token_present: present(accessToken),
  },
  vercel_production_env: existsSync(join(ROOT, '.tmp-inspect', 'vercel-prod.env'))
    ? {
        url_value_redacted_by_cli: isRedactedEnvValue(vercelEnv.EXPO_PUBLIC_SUPABASE_URL),
        supabase_url_matches_project: vercelEnv.EXPO_PUBLIC_SUPABASE_URL === EXPECTED_URL,
        anon_key_present:
          present(vercelEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY) &&
          !isRedactedEnvValue(vercelEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY),
        anon_key_looks_placeholder: hasPlaceholder(vercelEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY, [
          'your-anon-key',
          'your-anon',
        ]),
      }
    : {
        pulled: false,
        note: 'Run: npx vercel env pull .tmp-inspect/vercel-prod.env --environment production --yes',
      },
  public_auth_settings: null,
  hosted_auth_config: null,
};

if (present(supabaseUrl) && present(anonKey) && !report.local_env.anon_key_looks_placeholder) {
  const settingsRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!settingsRes.ok) {
    report.public_auth_settings = {
      error: `HTTP ${settingsRes.status}`,
    };
  } else {
    const settings = await settingsRes.json();
    report.public_auth_settings = {
      email_provider_enabled: settings?.external?.email ?? null,
      disable_signup: settings?.disable_signup ?? null,
      mailer_autoconfirm: settings?.mailer_autoconfirm ?? null,
      phone_autoconfirm: settings?.phone_autoconfirm ?? null,
      mailer_otp_exp: settings?.mailer_otp_exp ?? null,
      mailer_otp_length: settings?.mailer_otp_length ?? null,
    };
  }
} else {
  report.public_auth_settings = {
    skipped: true,
    reason: 'Local EXPO_PUBLIC_SUPABASE_URL / ANON_KEY missing or placeholder',
  };
}

if (present(accessToken)) {
  const authRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!authRes.ok) {
    report.hosted_auth_config = {
      error: `HTTP ${authRes.status}`,
      hint: 'Create a personal access token at https://supabase.com/dashboard/account/tokens',
    };
  } else {
    report.hosted_auth_config = redactAuthConfig(await authRes.json());
  }
} else {
  report.hosted_auth_config = {
    skipped: true,
    reason:
      'SUPABASE_ACCESS_TOKEN is not set. SMTP, Site URL, redirect URLs, and templates are not readable from the public Auth API.',
    dashboard_urls: {
      smtp: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/smtp`,
      url_configuration: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration`,
      templates: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/templates`,
      providers: `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`,
    },
  };
}

assertNoSecrets(report);
console.log(JSON.stringify(report, null, 2));
