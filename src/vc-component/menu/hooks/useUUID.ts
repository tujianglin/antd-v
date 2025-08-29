import { onMounted, ref, watch, type Ref } from 'vue';

const uniquePrefix = Math.random().toFixed(5).toString().slice(2);

let internalId = 0;

export default function useUUID(id?: Ref<string>) {
  const uuid = ref();

  watch(
    id,
    () => {
      uuid.value = id.value;
    },
    { immediate: true },
  );

  onMounted(() => {
    internalId += 1;
    const newId = process.env.NODE_ENV === 'test' ? 'test' : `${uniquePrefix}-${internalId}`;
    uuid.value = `rc-menu-uuid-${newId}`;
  });

  return uuid;
}
