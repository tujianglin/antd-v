import type { BaseInputProps, InputProps } from '../interface';

export function hasAddon(props: BaseInputProps | InputProps): boolean {
  return !!(props.addonBefore || props.addonAfter);
}

export function hasPrefixSuffix(props: BaseInputProps | InputProps): boolean {
  return !!(props.prefix || props.suffix || props.allowClear);
}

// ========================== 克隆事件 ==========================
function cloneEvent<T extends HTMLInputElement | HTMLTextAreaElement>(originalEvent: Event, target: T, value: string): Event {
  const currentTarget = target.cloneNode(true) as T;

  const newEvent = new Event(originalEvent.type, originalEvent) as Event & {
    target: T;
    currentTarget: T;
  };

  Object.defineProperties(newEvent, {
    target: { value: currentTarget },
    currentTarget: { value: currentTarget },
  });

  currentTarget.value = value;

  if (typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number') {
    currentTarget.selectionStart = target.selectionStart;
    currentTarget.selectionEnd = target.selectionEnd;
  }

  currentTarget.setSelectionRange = (...args) => {
    target.setSelectionRange(...args);
  };

  return newEvent;
}

// ========================== onChange 处理 ==========================
export function resolveOnChange<T extends HTMLInputElement | HTMLTextAreaElement>(
  target: T,
  e: Event,
  onChange?: (e: Event) => void,
  targetValue?: string,
): void {
  if (!onChange) return;

  let event = e;

  if (e.type === 'click') {
    event = cloneEvent(e, target, '');
    onChange(event);
    return;
  }

  if (target.type !== 'file' && targetValue !== undefined) {
    event = cloneEvent(e, target, targetValue);
    onChange(event);
    return;
  }

  onChange(event);
}

// ========================== triggerFocus ==========================
export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}

export function triggerFocus(element?: HTMLInputElement | HTMLTextAreaElement, option?: InputFocusOptions): void {
  if (!element) return;

  element.focus(option);

  const { cursor } = option || {};
  const len = element.value.length;

  if (cursor) {
    switch (cursor) {
      case 'start':
        element.setSelectionRange(0, 0);
        break;
      case 'end':
        element.setSelectionRange(len, len);
        break;
      default:
        element.setSelectionRange(0, len);
    }
  }
}
