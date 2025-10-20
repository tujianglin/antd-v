import { reactiveComputed } from '@vueuse/core';
import { assign } from 'lodash-es';
import { computed, defineComponent, toRefs } from 'vue';
import warning from '../_util/warning';
import ConfigProvider, { useConfigContextInject } from '../config-provider';
import { globalConfig } from '../config-provider/global';
import { unstableSetRender, type UnmountType } from '../config-provider/UnstableContext';
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
  setup(_, { attrs }) {
    const props = computed(() => assign({ focusTriggerAfterClose: true, mask: true, keyboard: true, maskClosable: true }, attrs));
    const {
      prefixCls: customizePrefixCls,
      getContainer,
      direction,
    } = toRefs(reactiveComputed(() => props.value as unknown as ConfirmDialogProps));
    const runtimeLocale = getConfirmLocale();

    const config = useConfigContextInject();
    const rootPrefixCls = computed(() => getRootPrefixCls() || config.getPrefixCls());
    // because Modal.config set rootPrefixCls, which is different from other components
    const prefixCls = computed(() => customizePrefixCls?.value || `${rootPrefixCls.value}-modal`);

    return () => (
      <ConfirmDialog
        {...props.value}
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

  const container = document.createDocumentFragment();
  let currentConfig = { ...config, close, open: true } as any;
  let timeoutId: ReturnType<typeof setTimeout>;

  let reactUnmount: UnmountType;

  function destroy(...args: any[]) {
    const triggerCancel = args.some((param) => param?.triggerCancel);
    if (triggerCancel) {
      config.onCancel?.(() => {}, ...args.slice(1));
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }

    reactUnmount();
  }

  function render(props: any) {
    clearTimeout(timeoutId);

    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    timeoutId = setTimeout(() => {
      const rootPrefixCls = global.getPrefixCls(undefined, getRootPrefixCls());
      const iconPrefixCls = global.getIconPrefixCls();
      const theme = global.getTheme();

      const dom = <ConfirmDialogWrapper {...props} />;

      const reactRender = unstableSetRender();

      reactUnmount = reactRender(
        <ConfigProvider prefixCls={rootPrefixCls} iconPrefixCls={iconPrefixCls} theme={theme}>
          {global.holderRender ? global.holderRender(dom) : dom}
        </ConfigProvider>,
        container,
      );
    });
  }

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose();
        }
        // @ts-ignore 111
        destroy.apply(this, args);
      },
    };

    render(currentConfig);
  }

  function update(configUpdate: ConfigUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate,
      };
    }
    render(currentConfig);
  }

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}

export function withWarn(props: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    type: 'warning',
  };
}

export function withInfo(props: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    type: 'info',
  };
}

export function withSuccess(props: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    type: 'success',
  };
}

export function withError(props: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    type: 'error',
  };
}

export function withConfirm(props: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    type: 'confirm',
  };
}

export function modalGlobalConfig({ rootPrefixCls }: { rootPrefixCls: string }) {
  warning(false, 'Modal', 'Modal.config is deprecated. Please use ConfigProvider.config instead.');
  defaultRootPrefixCls = rootPrefixCls;
}
