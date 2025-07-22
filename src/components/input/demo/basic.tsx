import { Input } from '@/components';
import type { InputRef } from '@/vc-component/input';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const inputRef = ref<InputRef>();

    onMounted(() => {
      console.log(inputRef.value);
    });
    return () => <Input ref={inputRef} placeholder="Basic usage" />;
  },
});
