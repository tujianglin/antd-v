<script lang="tsx" setup>
import { type CSSProperties } from 'vue';
import Tooltip from '..';
const text = () => <span>Tooltip Text</span>;
const arrowContent = () => <div class="rc-tooltip-arrow-inner"></div>;

const styles: CSSProperties = {
  display: 'table-cell',
  height: '60px',
  width: '80px',
  textAlign: 'center',
  background: '#f6f6f6',
  verticalAlign: 'middle',
  border: '5px solid white',
};

const rowStyle: CSSProperties = {
  display: 'table-row',
};
</script>
<template>
  <div :style="{ display: 'table', padding: '120px' }">
    <div :style="rowStyle">
      <Tooltip placement="left" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">Left</a>
      </Tooltip>
      <Tooltip placement="top" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">Top</a>
      </Tooltip>
      <Tooltip placement="bottom" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">Bottom</a>
      </Tooltip>
      <Tooltip placement="right" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">Right</a>
      </Tooltip>
    </div>
    <div :style="rowStyle">
      <Tooltip placement="leftTop" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">LeftTop</a>
      </Tooltip>
      <Tooltip placement="leftBottom" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">LeftBottom</a>
      </Tooltip>
      <Tooltip placement="rightTop" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">RightTop</a>
      </Tooltip>
      <Tooltip placement="rightBottom" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">RightBottom</a>
      </Tooltip>
    </div>
    <div :style="rowStyle">
      <Tooltip placement="topLeft" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">TopLeft</a>
      </Tooltip>
      <Tooltip placement="topRight" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">TopRight</a>
      </Tooltip>
      <Tooltip placement="bottomLeft" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">BottomLeft</a>
      </Tooltip>
      <Tooltip placement="bottomRight" :overlay="text" :arrow-content="arrowContent">
        <a href="#" :style="styles">BottomRight</a>
      </Tooltip>
    </div>
  </div>
</template>
