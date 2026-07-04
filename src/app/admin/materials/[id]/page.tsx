import { MaterialDetailView } from "@/features/library";

export default async function AdminMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MaterialDetailView materialId={id} />;
}
