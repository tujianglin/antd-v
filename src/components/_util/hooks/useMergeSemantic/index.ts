import { cn } from '@/utils/cn';
import { reactiveComputed } from '@vueuse/core';
import type { ComputedRef, CSSProperties } from 'vue';
import type { ValidChar } from './interface';

type TemplateSemanticClassNames<T extends string> = Partial<Record<T, string>>;

export type SemanticSchema = {
  _default?: string;
} & {
  [key: `${ValidChar}${string}`]: SemanticSchema;
};

// ========================= ClassNames =========================
export function mergeClassNames<
  T extends string,
  SemanticClassNames extends Partial<Record<T, any>> = TemplateSemanticClassNames<T>,
>(schema: SemanticSchema | undefined, ...classNames: (SemanticClassNames | undefined)[]) {
  const mergedSchema = schema || {};

  return classNames.reduce((acc: any, cur) => {
    // Loop keys of the current classNames
    Object.keys(cur || {}).forEach((key) => {
      const keySchema = mergedSchema[key as keyof SemanticSchema] as SemanticSchema;
      const curVal = (cur as SemanticClassNames)[key as keyof SemanticClassNames];

      if (keySchema && typeof keySchema === 'object') {
        if (curVal && typeof curVal === 'object') {
          // Loop fill
          acc[key] = mergeClassNames(keySchema, acc[key], curVal);
        } else {
          // Covert string to object structure
          const { _default: defaultField } = keySchema;
          acc[key] = acc[key] || {};
          acc[key][defaultField!] = cn(acc[key][defaultField!], curVal);
        }
      } else {
        // Flatten fill
        acc[key] = cn(acc[key], curVal);
      }
    });
    return acc;
  }, {} as SemanticClassNames) as SemanticClassNames;
}

function useSemanticClassNames<ClassNamesType extends object>(
  schema: SemanticSchema | undefined,
  ...classNames: (Partial<ClassNamesType> | undefined)[]
): Partial<ClassNamesType> {
  return mergeClassNames(schema, ...classNames) as ClassNamesType;
}

// =========================== Styles ===========================
function useSemanticStyles<StylesType extends object>(...styles: (Partial<StylesType> | undefined)[]) {
  return styles.reduce(
    (acc, cur = {}) => {
      Object.keys(cur).forEach((key) => {
        acc[key] = { ...acc[key], ...(cur as Record<string, CSSProperties>)[key] };
      });
      return acc;
    },
    {} as Record<string, CSSProperties>,
  );
}

// =========================== Export ===========================
function fillObjectBySchema<T extends object>(obj: T, schema: SemanticSchema): T {
  const newObj: any = { ...obj };

  Object.keys(schema).forEach((key) => {
    if (key !== '_default') {
      const nestSchema = (schema as any)[key] as SemanticSchema;
      const nextValue = newObj[key] || {};

      newObj[key] = nestSchema ? fillObjectBySchema(nextValue, nestSchema) : nextValue;
    }
  });

  return newObj;
}

/**
 * Merge classNames and styles from multiple sources.
 * When `schema` is provided, it will **must** provide the nest object structure.
 */
export default function useMergeSemantic<ClassNamesType extends object, StylesType extends object>(
  classNamesList: ComputedRef<(ClassNamesType | undefined)[]>,
  stylesList: ComputedRef<(StylesType | undefined)[]>,
  schema?: ComputedRef<SemanticSchema>,
) {
  return reactiveComputed(() => {
    const mergedClassNames = useSemanticClassNames(schema?.value, ...classNamesList.value) as ClassNamesType;
    const mergedStyles = useSemanticStyles(...stylesList.value) as StylesType;
    if (!schema) {
      return { mergedClassNames, mergedStyles } as const;
    }
    return {
      mergedClassNames: fillObjectBySchema(mergedClassNames, schema.value) as ClassNamesType,
      mergedStyles: fillObjectBySchema(mergedStyles, schema.value) as StylesType,
    } as const;
  });
}
