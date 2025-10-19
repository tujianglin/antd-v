export type UsePrefix = () => {
  /**
   * All the component use `@/vc-cssinjs-utils` should have same `rootPrefixCls`.
   */
  rootPrefixCls: string;
  /**
   * `iconPrefixCls` comes from the setting of `@ant-design/icons`.
   * Here maybe little coupling but everyone need use this.
   */
  iconPrefixCls: string;
};
