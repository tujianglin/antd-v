import type { KeyEntities, SafeKey } from '../interface';

export default function getEntity<T = any>(keyEntities: KeyEntities<T>, key: PropertyKey) {
  return keyEntities[key as SafeKey];
}
