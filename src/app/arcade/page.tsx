import { Portfolio } from '@/components/Portfolio';

export const metadata = {
  title: 'Arcade Mode | Rodney John',
  description: 'Play the arcade portfolio experience',
};

export default function ArcadePage() {
  return (
    <div className="arcade-mode">
      <Portfolio />
    </div>
  );
}
