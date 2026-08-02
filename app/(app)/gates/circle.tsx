import { AccountRequiredGate } from '@/features/auth';
import { HifzCircleScreen } from '@/features/home';

export default function CircleGateScreen() {
  return (
    <AccountRequiredGate feature="ai_hifz_circle">
      <HifzCircleScreen />
    </AccountRequiredGate>
  );
}
