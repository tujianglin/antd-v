import { reactiveComputed } from '@vueuse/core';
import { computed, toRefs, type Reactive } from 'vue';
import type { ErrorCorrectionLevel, ImageSettings } from '../interface';
import { QrCode, QrSegment } from '../libs/qrcodegen';
import { ERROR_LEVEL_MAP, getImageSettings } from '../utils';

interface Options {
  value: string;
  level: ErrorCorrectionLevel;
  minVersion: number;
  marginSize?: number;
  imageSettings?: ImageSettings;
  size: number;
  boostLevel?: boolean;
}

export const useQRCode = (opt: Reactive<Options>) => {
  const { value, level, minVersion, marginSize, imageSettings, size, boostLevel } = toRefs(opt);

  const memoizedQrcode = computed(() => {
    const segments = QrSegment.makeSegments(value.value);
    return QrCode.encodeSegments(
      segments,
      ERROR_LEVEL_MAP[level.value],
      minVersion.value,
      undefined,
      undefined,
      boostLevel.value,
    );
  });

  return reactiveComputed(() => {
    const cs = memoizedQrcode.value.getModules();
    const mg = Math.max(Math.floor(marginSize.value), 0);
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
