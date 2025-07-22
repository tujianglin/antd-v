<script lang="tsx" setup>
import { computed, h, ref, type Ref } from 'vue';
import Trigger from '../index';
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
  name: 'fade-top',
};

const MaskMotion = {
  name: 'mask-motion',
};

function useControl<T>(valuePropName: string, defaultValue: T): [Ref<any>, any] {
  const value = ref<T>(defaultValue);

  return [
    value,
    {
      value: value.value,
      checked: value.value,
      onChange({ target }) {
        value.value = target[valuePropName];
      },
    },
  ];
}

const [hover, hoverProps] = useControl('checked', true);
const [focus, focusProps] = useControl('checked', false);
const [click, clickProps] = useControl('checked', false);
const [contextMenu, contextMenuProps] = useControl('checked', false);

const [placement, placementProps] = useControl('value', 'right');
const [stretch, stretchProps] = useControl('value', '');
const [motion, motionProps] = useControl('checked', true);
const [destroyPopupOnHide, destroyPopupOnHideProps] = useControl('checked', false);
const [mask, maskProps] = useControl('checked', false);
const [maskClosable, maskClosableProps] = useControl('checked', true);
const [forceRender, forceRenderProps] = useControl('checked', false);
const [offsetX, offsetXProps] = useControl<number>('value', 0);
const [offsetY, offsetYProps] = useControl<number>('value', 0);

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
      <LabelItem title="Hover" v-bind="hoverProps">
        <input type="checkbox" />
      </LabelItem>
      <LabelItem title="Focus" v-bind="focusProps">
        <input type="checkbox" />
      </LabelItem>
      <LabelItem title="Click" v-bind="clickProps">
        <input type="checkbox" />
      </LabelItem>
      <LabelItem title="ContextMenu" v-bind="contextMenuProps">
        <input type="checkbox" />
      </LabelItem>
      <hr />
      <LabelItem title="Stretch" v-bind="stretchProps">
        <select>
          <option value="">--NONE--</option>
          <option value="width">width</option>
          <option value="minWidth">minWidth</option>
          <option value="height">height</option>
          <option value="minHeight">minHeight</option>
        </select>
      </LabelItem>

      <LabelItem title="Placement" v-bind="placementProps">
        <select>
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

      <LabelItem title="Motion" v-bind="motionProps">
        <input type="checkbox" />
      </LabelItem>

      <LabelItem title="Destroy Popup On Hide" v-bind="destroyPopupOnHideProps">
        <input type="checkbox" />
      </LabelItem>

      <LabelItem title="Mask" v-bind="maskProps">
        <input type="checkbox" />
      </LabelItem>

      <LabelItem title="Mask Closable" v-bind="maskClosableProps">
        <input type="checkbox" />
      </LabelItem>

      <LabelItem title="Force Render" v-bind="forceRenderProps">
        <input type="checkbox" />
      </LabelItem>

      <LabelItem title="OffsetX" v-bind="offsetXProps">
        <input />
      </LabelItem>

      <LabelItem title="OffsetY" v-bind="offsetYProps">
        <input />
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
        @popup-align="
          () => {
            console.warn('Aligned!');
          }
        "
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
