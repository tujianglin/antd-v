import Basic from '@/components/button/demo/basic';
import Block from '@/components/button/demo/block';
import ChineseSpace from '@/components/button/demo/chinese-space';
import ColorVariant from '@/components/button/demo/color-variant';
import Danger from '@/components/button/demo/danger';
import Disabled from '@/components/button/demo/disabled';
import Ghost from '@/components/button/demo/ghost';
import IconPosition from '@/components/button/demo/icon-position';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <>
        <Basic></Basic>
        <ChineseSpace></ChineseSpace>
        <ColorVariant></ColorVariant>
        <Danger></Danger>
        <Disabled></Disabled>
        <Ghost></Ghost>
        <IconPosition></IconPosition>
        <Block></Block>
      </>
    );
  },
});
