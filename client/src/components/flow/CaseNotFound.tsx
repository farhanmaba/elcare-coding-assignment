import { useTranslations } from 'next-intl';
import Card from '../ui/Card';

export default function CaseNotFound() {
  const text = useTranslations('CaseNotFound');

  return (
    <Card className="text-center">
      <h2 className="text-xl font-semibold text-red-600">{text('title')}</h2>
      <p className="mt-2 text-slate-600">{text('description')}</p>
    </Card>
  );
}