import { useCallback, useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/i18n';

import {
  fetchFamilyMessages,
  notifyFamilyEvent,
  sendFamilyMessage,
  showLocalFamilyNotification,
  subscribeToFamilyMessages,
} from '../services';
import type { FamilyChatMessage, FamilyCircleState, FamilyMessageKind } from '../types';

export function useFamilyChat(circle: FamilyCircleState | null) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<FamilyChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    circle?.members.forEach((member) => map.set(member.id, member.display_name));
    return map;
  }, [circle]);

  const decorate = useCallback(
    (row: { id: string; family_id: string; sender_id: string; kind: FamilyMessageKind; body: string; created_at: string }): FamilyChatMessage => ({
      ...row,
      senderName: nameById.get(row.sender_id) ?? t('chat.family'),
      isMine: row.sender_id === circle?.actorId,
    }),
    [circle?.actorId, nameById, t],
  );

  useEffect(() => {
    if (!circle) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    void fetchFamilyMessages(circle.familyId)
      .then((rows) => {
        if (!cancelled) {
          setMessages(rows.map(decorate));
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Access denied');
        }
      });

    const unsubscribe = subscribeToFamilyMessages(circle.familyId, (row) => {
      setMessages((current) => {
        if (current.some((item) => item.id === row.id)) {
          return current;
        }
        const next = [...current, decorate(row)];
        if (row.sender_id !== circle.actorId) {
          showLocalFamilyNotification(
            t('chat.title'),
            `${nameById.get(row.sender_id) ?? t('chat.family')}: ${row.body}`,
          );
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [circle, decorate, nameById, t]);

  const send = useCallback(
    async (body: string, kind: FamilyMessageKind = 'text') => {
      if (!circle) {
        throw new Error('Access denied');
      }
      if (!circle.chatEnabled) {
        throw new Error('Chat is turned off for this child. Ask a parent to enable it.');
      }
      setSending(true);
      setError(null);
      try {
        const saved = await sendFamilyMessage({
          familyId: circle.familyId,
          senderId: circle.actorId,
          body,
          kind,
        });
        setMessages((current) =>
          current.some((item) => item.id === saved.id)
            ? current
            : [...current, decorate(saved)],
        );
        const recipients = circle.members
          .filter((member) => member.id !== circle.actorId)
          .map((member) => member.id);
        void notifyFamilyEvent({
          kind: 'message',
          familyId: circle.familyId,
          recipientIds: recipients,
          title: t('chat.title'),
          body: `${nameById.get(circle.actorId) ?? t('chat.family')}: ${saved.body}`,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Access denied');
        throw err;
      } finally {
        setSending(false);
      }
    },
    [circle, decorate, nameById, t],
  );

  return { messages, error, sending, send };
}
