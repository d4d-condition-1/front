/**
 * 앱 전역에서 공유하는 공통 타입.
 * 특정 기능에서만 쓰는 타입은 features/<기능>/types.ts 에 둔다.
 */

export type Nullable<T> = T | null;

export type ID = string | number;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
