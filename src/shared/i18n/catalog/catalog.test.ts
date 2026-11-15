import { describe, expect, it } from 'vitest'
import type { MessageTree } from '../translate'
import { catalogs } from './index'

function leaves(tree: MessageTree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, node]) => {
    const path = `${prefix}${key}`
    if (typeof node === 'string') return [[path, node]]
    if (typeof node.one === 'string' && typeof node.other === 'string') return [[`${path}.one`, node.one as string], [`${path}.other`, node.other as string]]
    return leaves(node as MessageTree, `${path}.`)
  })
}

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()

describe('catalogs', () => {
  it('use the same placeholders in every language', () => {
    const english = new Map(leaves(catalogs.en))

    const mismatched = leaves(catalogs.tr)
      .filter(([key, turkish]) => placeholders(english.get(key) ?? '').join() !== placeholders(turkish).join())
      .map(([key]) => key)

    expect(mismatched).toEqual([])
  })
})
