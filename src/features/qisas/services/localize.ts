import type { QisasLanguage, QisasQuestion } from '../types';

export function localizeText(
  text: { en: string; so: string },
  language: QisasLanguage,
): string {
  return language === 'so' ? text.so : text.en;
}

export function localizeQuestion(
  question: QisasQuestion,
  language: QisasLanguage,
): {
  id: string;
  type: QisasQuestion['type'];
  prompt: string;
  explanation: string;
  hint?: string;
  correctChoiceId?: string;
  choices?: { id: string; label: string }[];
  orderItems?: { id: string; label: string }[];
} {
  return {
    id: question.id,
    type: question.type,
    prompt: localizeText(question.prompt, language),
    explanation: localizeText(question.explanation, language),
    hint: question.hint ? localizeText(question.hint, language) : undefined,
    correctChoiceId: question.correctChoiceId,
    choices: question.choices?.map((choice) => ({
      id: choice.id,
      label: localizeText(choice.label, language),
    })),
    orderItems: question.orderItems?.map((item) => ({
      id: item.id,
      label: localizeText(item.label, language),
    })),
  };
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[i] = swap;
    next[j] = current;
  }
  return next;
}
