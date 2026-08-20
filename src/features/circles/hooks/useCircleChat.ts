import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CircleMessage, CircleMessageReaction } from '@/types';

import {
  fetchCircleMessages,
  fetchCircleReactions,
  reactToCircleMessage,
  sendCircleMessage,
  subscribeToCircleMessages,
  subscribeToCircleReactions,
} from '../services';
import type { CircleSummary } from '../types';

export function useCircleChat(circle: CircleSummary | null, actorId: string | null) {
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [reactions, setReactions] = useState<CircleMessageReaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadReactions = useCallback(async (rows: CircleMessage[]) => {
    const ids = rows.map((row) => row.id);
    setReactions(await fetchCircleReactions(ids));
  }, []);

  useEffect(() => {
    if (!circle || circle.timedOut) {
      setMessages([]);
      setReactions([]);
      return;
    }

    let cancelled = false;
    void fetchCircleMessages(circle.id)
      .then(async (rows) => {
        if (cancelled) {
          return;
        }
        setMessages(rows);
        await loadReactions(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Access denied');
        }
      });

    const unsubscribeMessages = subscribeToCircleMessages(circle.id, (message) => {
      setMessages((current) =>
        current.some((row) => row.id === message.id) ? current : [...current, message],
      );
    });
    const unsubscribeReactions = subscribeToCircleReactions(circle.id, () => {
      void fetchCircleMessages(circle.id).then((rows) => {
        setMessages(rows);
        void loadReactions(rows);
      });
    });

    return () => {
      cancelled = true;
      unsubscribeMessages();
      unsubscribeReactions();
    };
  }, [circle, loadReactions]);

  const send = useCallback(
    async (body: string) => {
      if (!circle || !actorId) {
        throw new Error('Access denied');
      }
      setSending(true);
      setError(null);
      try {
        const message = await sendCircleMessage({
          circleId: circle.id,
          senderId: actorId,
          body,
        });
        setMessages((current) =>
          current.some((row) => row.id === message.id) ? current : [...current, message],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Access denied');
        throw err;
      } finally {
        setSending(false);
      }
    },
    [actorId, circle],
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      if (!actorId) {
        throw new Error('Access denied');
      }
      await reactToCircleMessage({ messageId, profileId: actorId, emoji });
      setReactions((current) => {
        const withoutMine = current.filter(
          (row) => !(row.message_id === messageId && row.profile_id === actorId),
        );
        return [
          ...withoutMine,
          {
            message_id: messageId,
            profile_id: actorId,
            emoji,
            created_at: new Date().toISOString(),
          },
        ];
      });
    },
    [actorId],
  );

  const reactionsByMessage = useMemo(() => {
    const map = new Map<string, CircleMessageReaction[]>();
    for (const row of reactions) {
      const list = map.get(row.message_id) ?? [];
      list.push(row);
      map.set(row.message_id, list);
    }
    return map;
  }, [reactions]);

  return { messages, reactionsByMessage, error, sending, send, react };
}
