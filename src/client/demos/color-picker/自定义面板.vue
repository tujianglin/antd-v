<script lang="tsx" setup>
import { cyan, generate, green, presetPalettes, red } from '@ant-design/colors';
import { Col, ColorPicker, Divider, Render, Row, Space, theme } from '@/components';
import type { ColorPickerProps } from '@/components';
import { defineComponent } from 'vue';

type Presets = Required<ColorPickerProps>['presets'][number];

function genPresets(presets = presetPalettes) {
  return Object.entries(presets).map<Presets>(([label, colors]) => ({ label, colors, key: label }));
}

// eslint-disable-next-line vue/one-component-per-file
const HorizontalLayoutDemo = defineComponent({
  setup() {
    const { token } = theme.useToken();

    const presets = genPresets({
      primary: generate(token.value.colorPrimary),
      red,
      green,
      cyan,
    });

    const customPanelRender: ColorPickerProps['panelRender'] = (_, { components: { Picker, Presets } }) => {
      console.log();
      return (
        <Row justify="space-between" wrap={false}>
          <Col span={12}>
            <Render content={Presets}></Render>
          </Col>
          <Divider vertical style={{ height: 'auto' }} />
          <Col flex="auto">
            <Render content={Picker}></Render>
          </Col>
        </Row>
      );
    };

    return () => (
      <ColorPicker
        value={token.value.colorPrimary}
        styles={{ popupOverlayInner: { width: '480px' } }}
        presets={presets}
        panelRender={customPanelRender}
      />
    );
  },
});

// eslint-disable-next-line vue/one-component-per-file
const BasicDemo = defineComponent({
  setup() {
    return () => (
      <ColorPicker
        value="#1677ff"
        panelRender={(panel) => (
          <div class="custom-panel">
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.88)',
                lineHeight: '20px',
                marginBottom: '8px',
              }}
            >
              Color Picker
            </div>
            <Render content={panel}></Render>
          </div>
        )}
      />
    );
  },
});
</script>
<template>
  <Space vertical>
    <Space>
      <span>Add title:</span>
      <BasicDemo />
    </Space>
    <Space>
      <span>Horizontal layout:</span>
      <HorizontalLayoutDemo />
    </Space>
  </Space>
</template>
