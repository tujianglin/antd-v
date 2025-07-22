import { ref, type Ref } from 'vue';

/**
 * Keep input cursor in the correct position if possible.
 * Is this necessary since we have `formatter` which may mass the content?
 */
export default function useCursor(input: Ref<HTMLInputElement>, focused: Ref<boolean>): [() => void, () => void] {
  const selectionRef = ref<{
    start?: number;
    end?: number;
    value?: string;
    beforeTxt?: string;
    afterTxt?: string;
  }>(null);

  function recordCursor() {
    // Record position
    try {
      const { selectionStart: start, selectionEnd: end, value } = input.value;
      const beforeTxt = value.substring(0, start);
      const afterTxt = value.substring(end);

      selectionRef.value = {
        start,
        end,
        value,
        beforeTxt,
        afterTxt,
      };
    } catch {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  }

  /**
   * Restore logic:
   *  1. back string same
   *  2. start string same
   */
  function restoreCursor() {
    if (input && selectionRef.value && focused.value) {
      try {
        const { value } = input.value;
        const { beforeTxt, afterTxt, start } = selectionRef.value;

        let startPos = value.length;

        if (value.startsWith(beforeTxt)) {
          startPos = beforeTxt.length;
        } else if (value.endsWith(afterTxt)) {
          startPos = value.length - selectionRef.value.afterTxt.length;
        } else {
          const beforeLastChar = beforeTxt[start - 1];
          const newIndex = value.indexOf(beforeLastChar, start - 1);
          if (newIndex !== -1) {
            startPos = newIndex + 1;
          }
        }

        input.value.setSelectionRange(startPos, startPos);
      } catch {}
    }
  }

  return [recordCursor, restoreCursor];
}
