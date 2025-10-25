import { reactiveComputed } from '@vueuse/core';
import { assign } from 'lodash-es';
import { computed, createVNode, defineComponent, shallowReactive, toRefs, render as vueRender, type VNode } from 'vue';
import warning from '../_util/warning';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import { globalConfig } from '../config-provider/global';
import ConfirmDialog, { type ConfirmDialogProps } from './ConfirmDialog.vue';
import destroyFns from './destroyFns';
import type { ModalFuncProps } from './interface';
import { getConfirmLocale } from './locale';

let defaultRootPrefixCls = '';

function getRootPrefixCls() {
  return defaultRootPrefixCls;
}

export type ConfigUpdate = ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps);

export type ModalFunc = (props: ModalFuncProps) => {
  destroy: () => void;
  update: (configUpdate: ConfigUpdate) => void;
};

export type ModalStaticFunctions = Record<NonNullable<ModalFuncProps['type']>, ModalFunc>;

const ConfirmDialogWrapper = defineComponent({
  inheritAttrs: false,
  props: ['config'],
  setup(props) {
    const p = computed(() =>
      assign(
        {
          focusTriggerAfterClose: true,
          mask: true,
          keyboard: true,
          maskClosable: true,
        },
        props.config,
      ),
    );

    const {
      prefixCls: customizePrefixCls,
      getContainer,
      direction,
    } = toRefs(reactiveComputed(() => p.value as unknown as ConfirmDialogProps));

    const runtimeLocale = getConfirmLocale();
    const config = useConfigContextInject();

    const rootPrefixCls = computed(() => getRootPrefixCls() || config.getPrefixCls());
    const prefixCls = computed(() => customizePrefixCls?.value || `${rootPrefixCls.value}-modal`);

    return () => (
      <ConfirmDialog
        {...p.value}
        rootPrefixCls={rootPrefixCls?.value}
        prefixCls={prefixCls?.value}
        iconPrefixCls={config.iconPrefixCls}
        theme={config.theme}
        direction={direction?.value ?? config.direction}
        locale={config.locale?.Modal ?? runtimeLocale}
        getContainer={getContainer?.value}
      />
    );
  },
});

export default function confirm(config: ModalFuncProps) {
  const global = globalConfig();

  // ✅ 使用真实 DOM 容器，而不是 DocumentFragment
  const container = document.createDocumentFragment();
  document.body.appendChild(container);

  const reactiveConfig = shallowReactive({ ...config, open: true });
  let confirmDialogInstance: VNode | null = null;

  function destroy(...args: any[]) {
    if (confirmDialogInstance) {
      // 卸载 Vue 实例
      vueRender(null, container as any);
      confirmDialogInstance = null;
    }

    // 移除 DOM 节点
    container.parentNode?.removeChild(container);

    // onCancel 回调逻辑
    const triggerCancel = args.some((param) => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(() => {}, ...args.slice(1));
    }

    // 从 destroyFns 移除
    const index = destroyFns.indexOf(close);
    if (index !== -1) {
      destroyFns.splice(index, 1);
    }
  }

  function render() {
    const rootPrefixCls = global.getPrefixCls(undefined, getRootPrefixCls());
    const iconPrefixCls = global.getIconPrefixCls();
    const theme = global.getTheme();

    const dom = <ConfirmDialogWrapper config={reactiveConfig} />;

    const vm = createVNode(() => {
      return (
        <ConfigProvider prefixCls={rootPrefixCls} iconPrefixCls={iconPrefixCls} theme={theme}>
          {{
            default: () => {
              return global.holderRender ? global.holderRender(dom) : dom;
            },
          }}
        </ConfigProvider>
      );
    });

    vueRender(vm, container as any);
    return vm;
  }

  function close(this: typeof close, ...args: any[]) {
    assign(reactiveConfig, {
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose();
        }
        destroy.apply(this, args);
      },
    });

    update(reactiveConfig);
  }
  function update(configUpdate: ConfigUpdate) {
    if (typeof configUpdate === 'function') {
      Object.assign(reactiveConfig, configUpdate(reactiveConfig));
    } else {
      Object.assign(reactiveConfig, configUpdate);
    }
  }

  // 初始化渲染
  confirmDialogInstance = render();
  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}

// ================== Modal helpers ==================
export function withWarn(props: ModalFuncProps): ModalFuncProps {
  return { ...props, type: 'warning' };
}

export function withInfo(props: ModalFuncProps): ModalFuncProps {
  return { ...props, type: 'info' };
}

export function withSuccess(props: ModalFuncProps): ModalFuncProps {
  return { ...props, type: 'success' };
}

export function withError(props: ModalFuncProps): ModalFuncProps {
  return { ...props, type: 'error' };
}

export function withConfirm(props: ModalFuncProps): ModalFuncProps {
  return { ...props, type: 'confirm' };
}

export function modalGlobalConfig({ rootPrefixCls }: { rootPrefixCls: string }) {
  warning(false, 'Modal', 'Modal.config is deprecated. Please use ConfigProvider.config instead.');
  defaultRootPrefixCls = rootPrefixCls;
}
