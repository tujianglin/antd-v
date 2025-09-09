import { useStyleRegister } from '@/vc-cssinjs';

import { computed, type ComputedRef } from 'vue';
import type { CSPConfig } from '../../config-provider';
import { genIconStyle } from '../../style';
import useToken from '../useToken';

const useResetIconStyle = (iconPrefixCls: ComputedRef<string>, csp?: ComputedRef<CSPConfig>) => {
  const [theme, token] = useToken();
  // Generate style for icons
  return useStyleRegister(
    computed(() => ({
      theme: theme.value as any,
      token: token.value,
      hashId: '',
      path: ['ant-design-icons', iconPrefixCls.value],
      nonce: () => csp.value?.nonce,
      layer: {
        name: 'antd',
      },
    })),
    () => [genIconStyle(iconPrefixCls.value)],
  );
};

export default useResetIconStyle;
