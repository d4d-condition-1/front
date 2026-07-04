/**
 * 조건부 Tailwind className을 합칠 때 사용하는 헬퍼.
 * falsy 값(false/null/undefined)은 제거하고 공백으로 join한다.
 *
 * 클래스 충돌(예: `px-2 px-4`)까지 병합해야 하면
 * `clsx` + `tailwind-merge` 조합으로 교체한다.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
