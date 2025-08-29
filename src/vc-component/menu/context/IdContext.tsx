import { computed, defineComponent, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

const IdContext: InjectionKey<Ref<string>> = Symbol('IdContext');

export const useIdContextInject = () => {
  return inject(IdContext, ref(''));
};

export const useIdContextProvider = (props: Ref<string>) => {
  provide(IdContext, props);
};

export const IdContextProvider = defineComponent({
  props: {
    value: String,
  },
  setup(props, { slots }) {
    useIdContextProvider(computed(() => props.value));
    return () => <>{slots?.default?.()}</>;
  },
});

export function getMenuId(uuid: string, eventKey: string) {
  if (uuid === undefined) {
    return null;
  }
  return `${uuid}-${eventKey}`;
}

/**
 * Get `data-menu-id`
 */
export function useMenuId(eventKey: Ref<string>) {
  const id = useIdContextInject();
  return computed(() => getMenuId(id?.value, eventKey.value));
}
