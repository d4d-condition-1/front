"use client";

import { useEffect } from "react";

import { fetchCategories } from "../api/categoryApi";

/** 앱 부트 시 서버 카테고리를 모듈 캐시에 동기화한다. 렌더링 없음. */
export function CategoriesLoader() {
  useEffect(() => {
    fetchCategories().catch(() => {});
  }, []);
  return null;
}
