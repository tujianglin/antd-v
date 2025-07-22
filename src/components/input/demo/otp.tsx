import { Flex, Input } from '@/components';
import { defineComponent } from 'vue';
import type { OTPProps } from '../OTP/interface';

export default defineComponent({
  setup() {
    const onChange: OTPProps['onChange'] = (text) => {
      console.log('onChange:', text);
    };

    const onInput: OTPProps['onInput'] = (value) => {
      console.log('onInput:', value);
    };

    const sharedProps: OTPProps = {
      onChange,
      onInput,
    };
    return () => (
      <Flex gap="middle" align="flex-start" vertical>
        <Input.OTP formatter={(str) => str.toUpperCase()} {...sharedProps} />
        <Input.OTP disabled {...sharedProps} />
        <Input.OTP length={8} {...sharedProps} />
        <Input.OTP variant="filled" {...sharedProps} />
        <Input.OTP mask="🔒" {...sharedProps} />
        <Input.OTP separator={<span>/</span>} {...sharedProps} />
        <Input.OTP separator={(i) => <span style={{ color: i & 1 ? 'red' : 'blue' }}>—</span>} {...sharedProps} />
      </Flex>
    );
  },
});
