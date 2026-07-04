import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ChoiceProps {
  label: string;
  index: number;
  selected: boolean;
  revealed: boolean;
  isAnswer: boolean;
  onClick: () => void;
}

const LETTERS = ["A", "B", "C", "D", "E"];

/** 선택지 버튼. 상태: 기본 / 선택 / (공개 후) 정답 / 오답. */
export function Choice({ label, index, selected, revealed, isAnswer, onClick }: ChoiceProps) {
  const showCorrect = revealed && isAnswer;
  const showWrong = revealed && selected && !isAnswer;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
        showCorrect && "border-emerald-500 bg-emerald-50 text-emerald-800",
        showWrong && "border-red-400 bg-red-50 text-red-700",
        !revealed && selected && "border-indigo-500 bg-indigo-50 text-indigo-800",
        !revealed && !selected && "border-slate-200 bg-white text-slate-700 hover:border-indigo-300",
        revealed && !isAnswer && !selected && "border-slate-200 bg-white text-slate-400",
      )}
    >
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
          showCorrect && "bg-emerald-500 text-white",
          showWrong && "bg-red-400 text-white",
          !revealed && selected && "bg-indigo-500 text-white",
          !revealed && !selected && "bg-slate-100 text-slate-500",
          revealed && !isAnswer && !selected && "bg-slate-100 text-slate-400",
        )}
      >
        {showCorrect ? <Icon name="check" size={16} /> : showWrong ? <Icon name="x" size={16} /> : LETTERS[index]}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}
