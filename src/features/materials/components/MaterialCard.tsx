import Link from "next/link";

import { Badge, Card, Icon, ProgressBar } from "@/components/ui";
import type { Material } from "../types";

/** 학습자료 리스트 카드. 탭하면 문제 풀이로 이동. */
export function MaterialCard({ material }: { material: Material }) {
  return (
    <Link href={`/app/solve/${material.id}`}>
      <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon name={material.category === "LC" ? "book" : "target"} size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge tone={material.category === "LC" ? "amber" : "indigo"}>
              {material.part}
            </Badge>
            {material.tag && <Badge tone="green">{material.tag}</Badge>}
          </div>
          <p className="truncate font-semibold text-slate-900">{material.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar value={material.progress} className="flex-1" />
            <span className="text-xs font-medium text-slate-400">
              {material.progress}%
            </span>
          </div>
        </div>

        <Icon name="chevronRight" size={20} className="shrink-0 text-slate-300" />
      </Card>
    </Link>
  );
}
