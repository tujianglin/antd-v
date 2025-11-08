import { computed, defineComponent, inject, provide, ref, type InjectionKey, type PropType, type Ref } from 'vue';

// ========================= Path Register =========================
export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void;
  unregisterPath: (key: string, keyPath: string[]) => void;
}

const PathRegisterContext: InjectionKey<PathRegisterContextProps> = Symbol('PathRegisterContext');

export const usePathRegisterContextInject = () => {
  return inject(PathRegisterContext, null);
};

export const usePathRegisterContextProvider = (props: PathRegisterContextProps) => {
  provide(PathRegisterContext, props);
};

export const PathRegisterContextProvider = defineComponent({
  props: {
    value: Object as PropType<PathRegisterContextProps>,
  },
  setup(props, { slots }) {
    usePathRegisterContextProvider(props.value);
    return () => slots?.default?.();
  },
});

// ========================= Path Tracker ==========================
const PathTrackerContext: InjectionKey<Ref<string[]>> = Symbol('PathTrackerContext');

export const usePathTrackerContextInject = () => {
  return inject(PathTrackerContext, ref([]));
};

export const usePathTrackerContextProvider = (props: Ref<string[]>) => {
  provide(PathTrackerContext, props);
};

export const PathTrackerContextProvider = defineComponent({
  props: {
    value: Array as PropType<string[]>,
  },
  setup(props, { slots }) {
    usePathTrackerContextProvider(computed(() => props.value));
    return () => slots?.default?.();
  },
});

export function useFullPath(eventKey?: Ref<string>) {
  const parentKeyPath = usePathTrackerContextInject();
  return computed(() => (eventKey?.value !== undefined ? [...parentKeyPath.value, eventKey?.value] : parentKeyPath.value));
}

// =========================== Path User ===========================
export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean;
}

const PathUserContext: InjectionKey<PathUserContextProps> = Symbol('PathUserContext');

export const usePathUserContextInject = () => {
  return inject(PathUserContext, {} as PathUserContextProps);
};

export const usePathUserContextProvider = (props: PathUserContextProps) => {
  provide(PathUserContext, props);
};

export const PathUserContextProvider = defineComponent({
  props: {
    value: Object as PropType<PathUserContextProps>,
  },
  setup(props, { slots }) {
    usePathUserContextProvider(props.value);
    return () => slots?.default?.();
  },
});
