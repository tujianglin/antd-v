import { useDisabledContextInject } from '../DisabledContext';
import { useSizeContextInject } from '../SizeContext';

function useConfig() {
  const componentDisabled = useDisabledContextInject();
  const componentSize = useSizeContextInject();

  return {
    componentDisabled,
    componentSize,
  };
}

export default useConfig;
