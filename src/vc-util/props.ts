import { Fragment } from 'vue';

export function falseToUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === false ? undefined : value]));
}
export const skipFlattenKey = Symbol('skipFlatten');

export function isEmptyElement(c: any) {
  return (
    c && (c.type === Comment || (c.type === Fragment && c.children.length === 0) || (c.type === Text && c.children.trim() === ''))
  );
}

export function isValid(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

function toCamelCase(str) {
  return str.toLowerCase().replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

export function keysToCamelCaseShallow(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = toCamelCase(key);
    acc[newKey] = value;
    return acc;
  }, {});
}

/**
 * 扁平化处理 props 里的事件
 * 例如：onClick 可以是函数，也可以是数组，都会被合并成一个函数
 * @param {Object} props 组件 props
 * @returns {Object} 处理后的 props
 */
export function normalizeEventProps(props) {
  const normalized = { ...props };

  Object.keys(normalized).forEach((key) => {
    // 只处理 onXXX 形式的事件
    if (key.startsWith('on') && normalized[key] !== null) {
      const handlers = Array.isArray(normalized[key]) ? normalized[key] : [normalized[key]];

      normalized[key] = function (event, ...args) {
        handlers.forEach((fn) => {
          if (typeof fn === 'function') fn(event, ...args);
        });
      };
    }
  });

  return normalized;
}
