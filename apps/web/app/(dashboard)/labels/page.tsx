import { getUserId } from '@/lib/auth';
import { labelService } from '@/services/instances';
import { LabelsClient } from './labels-client';

export default async function LabelsPage() {
  const userId = await getUserId();
  const labels = await labelService.list(userId);

  return <LabelsClient labels={labels.map((l) => ({ id: l.id, name: l.name, color: l.color }))} />;
}
