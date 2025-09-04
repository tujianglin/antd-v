import type { VueKey } from '@/vc-util/type';
import type { KeyEntities } from '../interface';

export default function getEntity<T = any>(keyEntities: KeyEntities<T>, key: VueKey) {
  return keyEntities[key as VueKey];
}
