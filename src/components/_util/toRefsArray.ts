import { computed, type ComputedRef } from 'vue';

export function toRefsArray<T>(arr: T[]): { [K in keyof T]: ComputedRef<T[K]> } {
  return arr.map((_, i) => computed(() => arr[i])) as any;
}
