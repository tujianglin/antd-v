import { ReloadOutlined } from '@ant-design/icons-vue';
import { propsToCamelCase } from '../_util/type';
import Button from '../button';
import type { Locale } from '../locale';
import Spin from '../spin';
import type { QRCodeProps, StatusRenderInfo } from './interface';

export type QRcodeStatusProps = {
  prefixCls: string;
  locale?: Locale['QRCode'];
  onRefresh?: QRCodeProps['onRefresh'];
  statusRender?: QRCodeProps['statusRender'];
  status: StatusRenderInfo['status'];
};

const defaultSpin = <Spin />;

export default function QRcodeStatus(props: QRcodeStatusProps) {
  const { prefixCls, locale, onRefresh, statusRender, status } = propsToCamelCase(props);
  const defaultExpiredNode = (
    <>
      <p class={`${prefixCls}-expired`}>{locale?.expired}</p>
      {onRefresh && (
        <Button type="link" icon={<ReloadOutlined />} onClick={onRefresh}>
          {locale?.refresh}
        </Button>
      )}
    </>
  );

  const defaultScannedNode = <p class={`${prefixCls}-scanned`}>{locale?.scanned}</p>;

  const defaultNodes = {
    expired: defaultExpiredNode,
    loading: defaultSpin,
    scanned: defaultScannedNode,
  };

  const defaultStatusRender: QRCodeProps['statusRender'] = (info) => defaultNodes[info.status];

  const mergedStatusRender = statusRender ?? defaultStatusRender;

  return mergedStatusRender({
    status,
    locale,
    onRefresh,
  });
}
