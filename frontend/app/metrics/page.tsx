import type { Metadata } from 'next';
import MetricsClient from './MetricsClient';

export const metadata: Metadata = { title: 'Métricas' };

export default function MetricsPage() {
  return <MetricsClient />;
}
