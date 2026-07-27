import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  return {
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
    limit: Number.isFinite(limit) && limit > 0 && limit <= 50 ? limit : 10,
  };
}

export function parseSort(value: string | null): "new" | "popular" {
  return value === "popular" ? "popular" : "new";
}

export function tooMany(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "تعداد درخواست‌ها بیش از حد مجاز است" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
