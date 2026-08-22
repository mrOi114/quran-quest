import { useEffect, useState } from 'react';

export const RESEND_COOLDOWN_MS = 60_000;

export function useResendCooldown(durationMs = RESEND_COOLDOWN_MS) {
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const remaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  function start() {
    setCooldownUntil(Date.now() + durationMs);
    setNow(Date.now());
  }

  return {
    remaining,
    isCoolingDown: remaining > 0,
    start,
  };
}
