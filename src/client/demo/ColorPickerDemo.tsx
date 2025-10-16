import { ColorPicker, Flex } from '@/components';
import { defineComponent, effect, ref } from 'vue';

export default defineComponent({
  setup() {
    const value = ref('#ffffff');

    effect(() => {
      console.log('ColorPicker', value.value);
    });
    return () => (
      <Flex align="center" gap={8}>
        <div style={{ width: '100px' }}>颜色选择器</div>
        <ColorPicker
          v-model:value={value.value}
          allowClear
          format="hsb"
          showText
          mode={['single', 'gradient']}
          onChangeComplete={(color) => {
            console.log(color.toCssString());
          }}
        />
      </Flex>
    );
  },
});
