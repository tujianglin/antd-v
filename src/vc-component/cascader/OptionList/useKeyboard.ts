import { reactiveComputed } from '@vueuse/core';
import { toRefs, type Ref } from 'vue';
import type { DefaultOptionType, InternalFieldNames, LegacyKey } from '../Cascader.vue';
import { getFullPathKeys, toPathKey } from '../utils/commonUtil';

export default (
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
  activeValueCells: Ref<LegacyKey[]>,
  setActiveValueCells: (activeValueCells: LegacyKey[]) => void,
  toggleOpen: (open?: boolean) => void,
) => {
  const { validActiveValueCells, lastActiveIndex, lastActiveOptions, fullPathKeys } = toRefs(
    reactiveComputed(() => {
      let activeIndex = -1;
      let currentOptions = options.value;

      const mergedActiveIndexes: number[] = [];
      const mergedActiveValueCells: LegacyKey[] = [];

      const len = activeValueCells.value.length;

      const pathKeys = getFullPathKeys(options.value, fieldNames.value);

      // Fill validate active value cells and index
      for (let i = 0; i < len && currentOptions; i += 1) {
        // Mark the active index for current options
        const nextActiveIndex = currentOptions.findIndex(
          (option, index) =>
            (pathKeys[index] ? toPathKey(pathKeys[index]) : option[fieldNames.value.value]) === activeValueCells.value[i],
        );

        if (nextActiveIndex === -1) {
          break;
        }

        activeIndex = nextActiveIndex;
        mergedActiveIndexes.push(activeIndex);
        mergedActiveValueCells.push(activeValueCells.value[i]);

        currentOptions = currentOptions[activeIndex][fieldNames.value.children];
      }

      // Fill last active options
      let activeOptions = options.value;
      for (let i = 0; i < mergedActiveIndexes.length - 1; i += 1) {
        activeOptions = activeOptions[mergedActiveIndexes[i]][fieldNames.value.children];
      }

      return {
        validActiveValueCells: mergedActiveValueCells,
        lastActiveIndex: activeIndex,
        lastActiveOptions: activeOptions,
        fullPathKeys: pathKeys,
      };
    }),
  );

  // Update active value cells and scroll to target element
  const internalSetActiveValueCells = (next: LegacyKey[]) => {
    setActiveValueCells(next);
  };

  // Same options offset
  const offsetActiveOption = (offset: number) => {
    const len = lastActiveOptions.value.length;

    let currentIndex = lastActiveIndex.value;
    if (currentIndex === -1 && offset < 0) {
      currentIndex = len;
    }

    for (let i = 0; i < len; i += 1) {
      currentIndex = (currentIndex + offset + len) % len;
      const option = lastActiveOptions.value[currentIndex];
      if (option && !option.disabled) {
        const nextActiveCells = validActiveValueCells.value
          .slice(0, -1)
          .concat(fullPathKeys[currentIndex] ? toPathKey(fullPathKeys[currentIndex]) : option[fieldNames.value.value]);
        internalSetActiveValueCells(nextActiveCells);
        return;
      }
    }
  };

  // Different options offset
  const prevColumn = () => {
    if (validActiveValueCells.value.length > 1) {
      const nextActiveCells = validActiveValueCells.value.slice(0, -1);
      internalSetActiveValueCells(nextActiveCells);
    } else {
      toggleOpen(false);
    }
  };

  const nextColumn = () => {
    const nextOptions: DefaultOptionType[] = lastActiveOptions.value[lastActiveIndex.value]?.[fieldNames.value.children] || [];

    const nextOption = nextOptions.find((option) => !option.disabled);

    if (nextOption) {
      const nextActiveCells = [...validActiveValueCells.value, nextOption[fieldNames.value.value]];
      internalSetActiveValueCells(nextActiveCells);
    }
  };
  return {
    offsetActiveOption,
    nextColumn,
    prevColumn,
    validActiveValueCells,
    lastActiveIndex,
    lastActiveOptions,
  };
};
