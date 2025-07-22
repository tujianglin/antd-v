import { Input, Radio } from '@/components';
import { defineComponent, ref, type CSSProperties } from 'vue';
import type { RadioChangeEvent } from '../interface';

const style: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export default defineComponent({
  setup() {
    const value = ref(1);

    const onChange = (e: RadioChangeEvent) => {
      value.value = e.target.value;
    };

    return () => (
      <Radio.Group
        style={style}
        onChange={onChange}
        value={value}
        options={[
          { value: 1, label: 'Option A' },
          { value: 2, label: 'Option B' },
          { value: 3, label: 'Option C' },
          {
            value: 4,
            label: (
              <>
                More...
                {value.value === 4 && (
                  <Input variant="filled" placeholder="please input" style={{ width: '120px', marginInlineStart: '12px' }} />
                )}
              </>
            ),
          },
        ]}
      />
    );
  },
});
