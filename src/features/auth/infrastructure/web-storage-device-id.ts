/** Identifies this browser to the auth service (`device_id`), the same on every visit. */
export class WebStorageDeviceId {
  static readonly storageKey = 'pf-demo.device-id'

  private readonly storage: Pick<Storage, 'getItem' | 'setItem'>
  private readonly createId: () => string
  private id: string | null = null

  constructor(storage: Pick<Storage, 'getItem' | 'setItem'>, createId: () => string = () => crypto.randomUUID()) {
    this.storage = storage
    this.createId = createId
  }

  current(): string {
    this.id ??= this.storage.getItem(WebStorageDeviceId.storageKey) ?? this.remember(this.createId())
    return this.id
  }

  private remember(id: string): string {
    try {
      this.storage.setItem(WebStorageDeviceId.storageKey, id)
    } catch {
      // Storage is blocked (e.g. private browsing): the id still holds for this visit.
    }
    return id
  }
}
