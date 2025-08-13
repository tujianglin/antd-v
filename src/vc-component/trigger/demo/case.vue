<script lang="tsx" setup>
import { computed, h, ref } from 'vue';
import Trigger from '..';
import type { ActionType, BuildInPlacements } from '../interface';
import LabelItem from './LabelItem.vue';
const builtinPlacements: BuildInPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

const Motion = {
  motionName: 'case-motion',
};

const MaskMotion = {
  motionName: 'mask-motion',
};

const hover = ref(true);
const focus = ref(false);
const click = ref(false);
const contextMenu = ref(false);

const placement = ref('right');
const stretch = ref('');
const motion = ref(true);
const destroyPopupOnHide = ref(false);
const mask = ref(false);
const maskClosable = ref(true);
const forceRender = ref(false);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);

const actionsKeys = computed(() => {
  const actions = {
    hover: hover.value,
    focus: focus.value,
    click: click.value,
    contextMenu: contextMenu.value,
  };
  return Object.keys(actions).filter((action) => actions[action]) as ActionType[];
});
</script>
<template>
  <div>
    <div :style="{ margin: '10px 20px' }">
      <strong>Actions: </strong>
      <LabelItem title="Hover">
        <input type="checkbox" :checked="hover" @change="(e) => (hover = (e.target as any).checked)" />
      </LabelItem>
      <LabelItem title="Focus">
        <input type="checkbox" :checked="focus" @change="(e) => (focus = (e.target as any).checked)" />
      </LabelItem>
      <LabelItem title="Click">
        <input type="checkbox" :checked="click" @change="(e) => (click = (e.target as any).checked)" />
      </LabelItem>
      <LabelItem title="ContextMenu">
        <input type="checkbox" :checked="contextMenu" @change="(e) => (contextMenu = (e.target as any).checked)" />
      </LabelItem>
      <hr />
      <LabelItem title="Stretch">
        <select :value="stretch" @change="(e) => (stretch = (e.target as any).value)">
          <option value="">--NONE--</option>
          <option value="width">width</option>
          <option value="minWidth">minWidth</option>
          <option value="height">height</option>
          <option value="minHeight">minHeight</option>
        </select>
      </LabelItem>

      <LabelItem title="Placement">
        <select :value="placement" @change="(e) => (placement = (e.target as any).value)">
          <option>right</option>
          <option>left</option>
          <option>top</option>
          <option>bottom</option>
          <option>topLeft</option>
          <option>topRight</option>
          <option>bottomRight</option>
          <option>bottomLeft</option>
        </select>
      </LabelItem>

      <LabelItem title="Motion">
        <input type="checkbox" :checked="motion" @change="(e) => (motion = (e.target as any).checked)" />
      </LabelItem>

      <LabelItem title="Destroy Popup On Hide">
        <input type="checkbox" :checked="destroyPopupOnHide" @change="(e) => (destroyPopupOnHide = (e.target as any).checked)" />
      </LabelItem>

      <LabelItem title="Mask">
        <input type="checkbox" :checked="mask" @change="(e) => (mask = (e.target as any).checked)" />
      </LabelItem>

      <LabelItem title="Mask Closable">
        <input type="checkbox" :checked="maskClosable" @change="(e) => (maskClosable = (e.target as any).checked)" />
      </LabelItem>

      <LabelItem title="Force Render">
        <input type="checkbox" :checked="forceRender" @change="(e) => (forceRender = (e.target as any).checked)" />
      </LabelItem>

      <LabelItem title="OffsetX">
        <input :value="offsetX" @input="(e) => (offsetX = (e.target as any).value)" />
      </LabelItem>

      <LabelItem title="OffsetY">
        <input :value="offsetY" @input="(e) => (offsetY = (e.target as any).value)" />
      </LabelItem>
    </div>
    <div :style="{ margin: '120px', position: 'relative' }">
      <Trigger
        :popup-align="{
          offset: [offsetX, offsetY],
          overflow: {
            adjustX: 1,
            adjustY: 1,
          },
        }"
        :popup-placement="placement"
        :auto-destroy="destroyPopupOnHide"
        :mask="mask"
        :mask-motion="motion ? MaskMotion : null"
        :mask-closable="maskClosable"
        :stretch="stretch"
        :action="actionsKeys"
        :builtin-placements="builtinPlacements"
        :force-render="forceRender"
        :popup-style="{
          border: '1px solid red',
          padding: '10px',
          background: 'white',
          boxSizing: 'border-box',
        }"
        :popup="h('div', {}, 'i am a popup')"
        :popup-motion="motion ? Motion : null"
        @popup-align="() => {}"
      >
        <div
          :style="{
            margin: '20px',
            display: 'inline-block',
            background: 'rgba(255, 0, 0, 0.05)',
          }"
          :tabIndex="0"
          role="button"
        >
          <p>This is a example of trigger usage.</p>
          <p>You can adjust the value above</p>
          <p>which will also change the behaviour of popup.</p>
        </div>
      </Trigger>
    </div>
  </div>
</template>
<style lang="less">
@import './case.less';
</style>
