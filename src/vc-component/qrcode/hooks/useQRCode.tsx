import { reactiveComputed } from '@vueuse/core';
import { computed, toRefs, type Reactive } from 'vue';
import type { ErrorCorrectionLevel, ImageSettings } from '../interface';
import { QrCode, QrSegment } from '../libs/qrcodegen';
import { ERROR_LEVEL_MAP, getImageSettings, getMarginSize } from '../utils';

interface Options {
  value: string;
  level: ErrorCorrectionLevel;
  minVersion: number;
  includeMargin: boolean;
  marginSize?: number;
  imageSettings?: ImageSettings;
  size: number;
}

export const useQRCode = (opt: Reactive<Options>) => {
  const { value, level, minVersion, includeMargin, marginSize, imageSettings, size } = toRefs(opt);

  const memoizedQrcode = computed(() => {
    const segments = QrSegment.makeSegments(value.value);
    return QrCode.encodeSegments(segments, ERROR_LEVEL_MAP[level.value], minVersion.value);
  });

  return reactiveComputed(() => {
    const cs = memoizedQrcode.value.getModules();
    console.log(includeMargin.value, marginSize.value);
    const mg = getMarginSize(includeMargin.value, marginSize.value);
    console.log(mg);
    const ncs = cs.length + mg * 2;
    const cis = getImageSettings(cs, size.value, mg, imageSettings.value);
    return {
      cells: cs,
      margin: mg,
      numCells: ncs,
      calculatedImageSettings: cis,
      qrcode: memoizedQrcode,
    };
  });
};
