import type { Locale } from '../locale'
import type { PluralMessage } from '../translate'
import { en } from './en'
import { tr } from './tr'

/** The shape every catalog must have: the Turkish catalog's keys, with any wording. */
export type Messages = CatalogShape<typeof tr>

type CatalogShape<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends PluralMessage ? PluralMessage : CatalogShape<T[K]>
}

/** Every message key, as a dotted path (`users.create.title`). */
export type MessageKey = KeysOf<Messages>

type KeysOf<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | PluralMessage ? `${Prefix}${K}` : KeysOf<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export const catalogs: Record<Locale, Messages> = { tr, en }
