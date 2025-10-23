<script lang="tsx" setup>
import { Button, QRCode, Segmented, Space } from '@/components';
import { ref } from 'vue';
function doDownload(url: string, fileName: string) {
  const a = document.createElement('a');
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const downloadCanvasQRCode = () => {
  console.log(1111);
  const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
  if (canvas) {
    const url = canvas.toDataURL();
    doDownload(url, 'QRCode.png');
  }
};

const downloadSvgQRCode = () => {
  const svg = document.getElementById('myqrcode')?.querySelector<SVGElement>('svg');
  const svgData = new XMLSerializer().serializeToString(svg!);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  doDownload(url, 'QRCode.svg');
};

const renderType = ref<'canvas' | 'svg'>('canvas');
</script>
<template>
  <Space id="myqrcode" vertical>
    <Segmented :options="['canvas', 'svg']" v-model:value="renderType" />
    <div>
      <QRCode
        :type="renderType"
        value="https://ant.design/"
        bg-color="#fff"
        class="!mb-4"
        icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
      />
      <Button type="primary" @click="() => (renderType === 'canvas' ? downloadCanvasQRCode() : downloadSvgQRCode())">
        Download
      </Button>
    </div>
  </Space>
</template>
