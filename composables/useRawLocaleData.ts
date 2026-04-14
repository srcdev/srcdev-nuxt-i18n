import { useI18n } from "vue-i18n"

/**
 * Fetch raw locale data and normalize it into pure JSON.
 * Supports fallback to defaultValue for safer usage.
 *
 * @param path - Dot notation path to the message key (e.g., "pages.homepage.sections.logos")
 * @param defaultValue - Optional fallback value if key is not found
 * @returns Normalized value as type T
 */
export function useRawLocaleData<T>(path: string, defaultValue?: T): T {
  const { locale, getLocaleMessage, tm } = useI18n()

  let data: unknown = null

  // 1. Try from raw locale messages
  const rawMessages = getLocaleMessage(locale.value)
  if (rawMessages && Object.keys(rawMessages).length > 0) {
    data = resolvePath(rawMessages as Record<string, unknown>, path)
  }

  // 2. Fallback to tm() if nothing found
  if (data == null) {
    const fallback = tm(path)
    if (fallback !== undefined) data = fallback
  }

  // 3. Normalize AST
  const normalized = normalizeNode<T>(data)

  // 4. Return normalized or default
  return normalized ?? (defaultValue as T)
}

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".")
  let current: unknown = obj

  for (const key of segments) {
    if (typeof current === "object" && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return null
    }
  }

  return current
}

function normalizeNode<T>(node: unknown): T | null {
  if (node == null) return null

  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return node as T
  }

  if (
    typeof node === "object" &&
    "body" in (node as Record<string, unknown>) &&
    (node as Record<string, unknown>).body &&
    typeof (node as Record<string, { static?: string }>).body?.static === "string"
  ) {
    return (node as { body: { static: string } }).body.static as unknown as T
  }

  if (Array.isArray(node)) {
    return node.map((item) => normalizeNode<unknown>(item)) as unknown as T
  }

  if (typeof node === "object") {
    const result: Record<string, unknown> = {}
    for (const key in node as Record<string, unknown>) {
      result[key] = normalizeNode<unknown>((node as Record<string, unknown>)[key])
    }
    return result as unknown as T
  }

  return null
}
