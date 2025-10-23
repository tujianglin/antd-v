<script lang="tsx" setup>
import { Button, Divider, Image, Modal } from '@/components';
import { ref } from 'vue';

const show1 = ref(false);
const show2 = ref(false);
const show3 = ref(false);
</script>
<template>
  <Button
    @click="
      () => {
        show1 = true;
      }
    "
  >
    showModal
  </Button>
  <Modal
    :open="show1"
    :after-open-change="
      (open) => {
        show1 = open;
      }
    "
    @cancel="
      () => {
        show1 = false;
      }
    "
    @ok="() => (show1 = false)"
  >
    <Button
      @click="
        () => {
          show2 = true;
        }
      "
    >
      test2
    </Button>
    <Modal
      :open="show2"
      :after-open-change="
        (open) => {
          show2 = open;
        }
      "
      @cancel="
        () => {
          show2 = false;
        }
      "
      @ok="() => (show2 = false)"
    >
      <Button
        @click="
          () => {
            show3 = true;
          }
        "
      >
        test3
      </Button>
      <Modal
        :open="show3"
        :after-open-change="
          (open) => {
            show3 = open;
          }
        "
        @cancel="
          () => {
            show3 = false;
          }
        "
        @ok="() => (show3 = false)"
      >
        <Image :width="200" alt="svg image" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
        <Divider />
        <Image.PreviewGroup
          :preview="{
            onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
          }"
        >
          <Image :width="200" alt="svg image" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
          <Image :width="200" src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg" />
        </Image.PreviewGroup>
      </Modal>
    </Modal>
  </Modal>
</template>
