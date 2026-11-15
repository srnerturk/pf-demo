import type { User } from '../domain/user'
import type { DirectoryUserGroup } from './in-memory-user-directory'

/** Demo data for the in-memory directory, so the screen has something realistic to show. */
export const demoUserGroups: readonly DirectoryUserGroup[] = [
  { id: 'administrators', name: 'Yöneticiler', roles: ['ADMIN_ROLE', 'HR', 'MUHASEBE', 'FİNANS', 'TECH', 'OPERASYON', 'FRAUD', 'PRODUCT', 'RİSK'] },
  { id: 'finance', name: 'Finans', roles: ['MUHASEBE', 'FİNANS'] },
  { id: 'operations', name: 'Operasyon', roles: ['OPERASYON', 'PRODUCT'] },
  { id: 'risk', name: 'Risk ve Fraud', roles: ['RİSK', 'FRAUD'] },
  { id: 'technology', name: 'Teknoloji', roles: ['TECH'] },
  { id: 'human-resources', name: 'İnsan Kaynakları', roles: ['HR'] },
]

const firstNames = ['Özgür', 'Volkan', 'Muhammet', 'Ekin', 'İlayda', 'Eyüp', 'Bahadır', 'Ömer', 'Atıl', 'Zeynep', 'Selin', 'Burak', 'Çağla', 'Şule', 'Gökhan', 'Deniz', 'Elif', 'Kerem', 'Merve', 'Tolga']
const lastNames = ['Kaya', 'Yılmaz', 'Ertürk', 'Bilgin', 'Bulut', 'Alasonyalılar', 'Erten', 'Sevim', 'Sönmezsoy', 'Akguş', 'Demir', 'Şahin', 'Çelik', 'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Koç']

const ASCII_LETTERS: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u' }
const FIRST_ID = 2300
const DAY_MS = 24 * 60 * 60 * 1000
const SEED_START = Date.UTC(2026, 0, 5, 9, 0)

export const demoUsers: readonly User[] = Array.from({ length: 119 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[(index * 7) % lastNames.length]
  const group = demoUserGroups[index % demoUserGroups.length]
  const createdAt = new Date(SEED_START + index * 2.5 * DAY_MS + (index % 9) * 37 * 60 * 1000)
  return {
    id: FIRST_ID + index * 4 + (index % 3),
    firstName,
    lastName,
    email: `${asciiHandle(firstName)}.${asciiHandle(lastName)}${index}@example.com`,
    status: index % 7 === 3 ? 'passive' : 'active',
    roles: group.roles,
    createdAt,
    updatedAt: new Date(createdAt.getTime() + (index % 5) * DAY_MS),
  }
})

function asciiHandle(name: string): string {
  return [...name.toLocaleLowerCase('tr')].map((letter) => ASCII_LETTERS[letter] ?? letter).join('')
}
