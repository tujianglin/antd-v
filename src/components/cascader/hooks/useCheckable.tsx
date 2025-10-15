import { computed, type Ref } from 'vue';

export default function useCheckable(cascaderPrefixCls: Ref<string>, multiple?: Ref<boolean>) {
  return computed(() => (multiple.value ? <span class={`${cascaderPrefixCls.value}-checkbox-inner`} /> : false));
}
