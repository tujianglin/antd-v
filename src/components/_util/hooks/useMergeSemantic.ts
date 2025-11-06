import { clsx } from 'clsx';
import { computed, type ComputedRef, type CSSProperties } from 'vue';
import type { AnyObject, EmptyObject, ValidChar } from '../type';

export type SemanticSchema = { _default?: string } & {
  [key: `${ValidChar}${string}`]: SemanticSchema;
};

export type SemanticClassNames<Name extends string> = Partial<Record<Name, string>>;

export type SemanticStyles<Name extends string> = Partial<Record<Name, CSSProperties>>;

export type Resolvable<T, P extends AnyObject> = T | ((info: { props: P }) => T);

export type SemanticClassNamesType<
  Props extends AnyObject,
  SemanticName extends string,
  NestedStructure extends EmptyObject = EmptyObject,
> = Resolvable<Readonly<SemanticClassNames<SemanticName>>, Props> & NestedStructure;

export type SemanticStylesType<
  Props extends AnyObject,
  SemanticName extends string,
  NestedStructure extends EmptyObject = EmptyObject,
> = Resolvable<Readonly<SemanticStyles<SemanticName>>, Props> & NestedStructure;

// ========================= ClassNames =========================
export const mergeClassNames = <Name extends string, SemanticClassNames extends Partial<Record<Name, any>>>(
  schema?: SemanticSchema,
  ...classNames: (SemanticClassNames | undefined)[]
) => {
  const mergedSchema = schema || {};
  return classNames.filter(Boolean).reduce<SemanticClassNames>((acc: any, cur) => {
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
          if (defaultField) {
            acc[key] = acc[key] || {};
            acc[key][defaultField] = clsx(acc[key][defaultField], curVal);
          }
        }
      } else {
        // Flatten fill
        acc[key] = clsx(acc[key], curVal);
      }
    });
    return acc;
  }, {} as SemanticClassNames);
};

const useSemanticClassNames = <ClassNamesType extends AnyObject>(
  schema?: SemanticSchema,
  ...classNames: (Partial<ClassNamesType> | undefined)[]
): Partial<ClassNamesType> => {
  return mergeClassNames(schema, ...classNames);
};

// =========================== Styles ===========================
export const mergeStyles = <StylesType extends AnyObject>(...styles: (Partial<StylesType> | undefined)[]) => {
  return styles.filter(Boolean).reduce<Record<PropertyKey, CSSProperties>>((acc, cur = {}) => {
    Object.keys(cur).forEach((key) => {
      acc[key] = { ...acc[key], ...cur[key] };
    });
    return acc;
  }, {});
};

const useSemanticStyles = <StylesType extends AnyObject>(...styles: (Partial<StylesType> | undefined)[]) => {
  return mergeStyles(...styles) as StylesType;
};

// =========================== Export ===========================
const fillObjectBySchema = <T extends AnyObject>(obj: T, schema: SemanticSchema): T => {
  const newObj: any = { ...obj };
  Object.keys(schema).forEach((key) => {
    if (key !== '_default') {
      const nestSchema = (schema as any)[key] as SemanticSchema;
      const nextValue = newObj[key] || {};
      newObj[key] = nestSchema ? fillObjectBySchema(nextValue, nestSchema) : nextValue;
    }
  });
  return newObj;
};

export const resolveStyleOrClass = <T extends AnyObject>(value: T | ((config: any) => T), info: { props: AnyObject }) => {
  return typeof value === 'function' ? value(info) : value;
};

type MaybeFn<T, P> = T | ((info: { props: P }) => T) | undefined;

type ObjectOnly<T> = T extends (...args: any) => any ? never : T;

/**
 * @desc Merge classNames and styles from multiple sources. When `schema` is provided, it **must** provide the nest object structure.
 * @descZH 合并来自多个来源的 classNames 和 styles，当提供了 `schema` 时，必须提供嵌套的对象结构。
 */
export const useMergeSemantic = <ClassNamesType extends AnyObject, StylesType extends AnyObject, Props extends AnyObject>(
  classNamesList: ComputedRef<MaybeFn<ClassNamesType, Props>[]>,
  stylesList: ComputedRef<MaybeFn<StylesType, Props>[]>,
  info: ComputedRef<{ props: Props }>,
  schema?: ComputedRef<SemanticSchema>,
) => {
  const resolvedClassNamesList = computed(() =>
    classNamesList.value.map((classNames) => (classNames ? resolveStyleOrClass(classNames, info.value) : undefined)),
  );

  const resolvedStylesList = computed(() =>
    stylesList.value.map((styles) => (styles ? resolveStyleOrClass(styles, info.value) : undefined)),
  );

  const mergedClassNames = computed(() => {
    const result = useSemanticClassNames(schema?.value, ...resolvedClassNamesList.value) as ObjectOnly<ClassNamesType>;
    if (!schema?.value) {
      return result;
    }
    return fillObjectBySchema(result, schema.value) as ObjectOnly<ClassNamesType>;
  });

  const mergedStyles = computed(() => {
    const result = useSemanticStyles(...resolvedStylesList.value) as ObjectOnly<StylesType>;
    if (!schema?.value) {
      return result;
    }
    return fillObjectBySchema(result, schema.value) as ObjectOnly<StylesType>;
  });

  return [mergedClassNames, mergedStyles] as const;
};
