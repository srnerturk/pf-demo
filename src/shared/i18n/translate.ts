import type { Locale } from './locale'

/** A message whose wording depends on a count, chosen with the language's plural rules. */
export interface PluralMessage {
  one: string
  other: string
}

export interface MessageTree {
  [key: string]: string | PluralMessage | MessageTree
}

export type MessageParams = Record<string, string | number>

/**
 * Looks up `key` (dotted path) in `catalog` and fills `{name}` placeholders from `params`.
 * Plural messages pick their form from `params.count`. A missing message returns the key
 * itself so the gap shows on screen instead of failing.
 */
export function translate(catalog: MessageTree, locale: Locale, key: string, params: MessageParams = {}): string {
  const message = lookUp(catalog, key)
  if (message === undefined) return key
  const template = typeof message === 'string' ? message : pluralForm(message, locale, Number(params.count ?? 0))
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  )
}

type MessageNode = MessageTree[string]

function lookUp(catalog: MessageTree, key: string): string | PluralMessage | undefined {
  let node: MessageNode | undefined = catalog
  for (const part of key.split('.')) {
    if (!isBranch(node)) return undefined
    node = node[part]
  }
  return isBranch(node) ? undefined : node
}

function isBranch(node: MessageNode | undefined): node is MessageTree {
  return typeof node === 'object' && !isPluralMessage(node)
}

function isPluralMessage(node: MessageNode): node is PluralMessage {
  return typeof node === 'object' && typeof node.one === 'string' && typeof node.other === 'string'
}

function pluralForm(message: PluralMessage, locale: Locale, count: number): string {
  return new Intl.PluralRules(locale).select(count) === 'one' ? message.one : message.other
}
