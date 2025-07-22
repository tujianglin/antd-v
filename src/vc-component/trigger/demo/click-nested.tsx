import { defineComponent, ref, type PropType } from 'vue';
import Trigger from '..';
const builtinPlacements = {
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

const popupBorderStyle = {
  border: '1px solid red',
  padding: '10px',
  background: 'rgba(255, 0, 0, 0.1)',
};

const NestPopup = defineComponent({
  props: {
    open: Boolean,
    setOpen: Function as PropType<(open: boolean) => void>,
  },
  setup(props) {
    return () => (
      <Trigger
        popupPlacement="right"
        action={['click']}
        builtinPlacements={builtinPlacements}
        popup={<div style={popupBorderStyle}>i am a click popup</div>}
        popupVisible={props.open}
        onOpenChange={props.setOpen}
      >
        <div style={popupBorderStyle}>
          i am a click popup{' '}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            I am preventPop
          </button>
        </div>
      </Trigger>
    );
  },
});

export default defineComponent({
  setup() {
    const open1 = ref(false);
    const open2 = ref(false);
    return () => (
      <div style={{ margin: '200x' }}>
        <div>
          <Trigger
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popupVisible={open1.value}
            onOpenChange={(val) => (open1.value = val)}
            popup={
              // Level 2
              <NestPopup open={open2.value} setOpen={(val) => (open2.value = val)} />
            }
            fresh
          >
            <span>Click Me</span>
          </Trigger>
        </div>
      </div>
    );
  },
});
