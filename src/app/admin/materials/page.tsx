import { AdminHeader } from "@/components/layout";
import { Badge, Button, Card, Icon } from "@/components/ui";
import { getMaterials } from "@/features/materials";

export default function AdminMaterialsPage() {
  const materials = getMaterials();

  return (
    <>
      <AdminHeader
        title="학습자료"
        description={`총 ${materials.length}개 자료`}
        action={
          <Button size="sm">
            <Icon name="plus" size={18} /> 자료 추가
          </Button>
        }
      />

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 md:p-8">
        {materials.map((m) => (
          <Card key={m.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={m.category === "LC" ? "amber" : "indigo"}>{m.part}</Badge>
              <Badge tone="slate">{m.level}</Badge>
              {m.tag && <Badge tone="green">{m.tag}</Badge>}
            </div>
            <p className="font-semibold text-slate-900">{m.title}</p>
            <p className="line-clamp-2 text-sm text-slate-500">{m.description}</p>
            <div className="mt-1 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Icon name="book" size={14} /> {m.questionCount}문항
              </span>
              <span className="flex items-center gap-1">
                <Icon name="clock" size={14} /> {m.minutes}분
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
