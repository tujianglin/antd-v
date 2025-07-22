import { onMounted, ref, type Ref } from 'vue';
import isMobile from '../isMobile';

/**
 * Hook to detect if the user is on a mobile device
 * Notice that this hook will only detect the device type in effect, so it will always be false in server side
 */
const useMobile = (): Ref<boolean> => {
  const mobile = ref(false);

  onMounted(() => {
    mobile.value = isMobile();
  });

  return mobile;
};

export default useMobile;
