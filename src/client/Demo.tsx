import { Divider, Flex, Tag } from '@/components';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';

const variants = ['filled', 'solid', 'outlined'] as const;
const presets = [
  { status: 'success', icon: <CheckCircleOutlined /> },
  { status: 'processing', icon: <SyncOutlined spin /> },
  { status: 'warning', icon: <ExclamationCircleOutlined /> },
  { status: 'error', icon: <CloseCircleOutlined /> },
  { status: 'default', icon: <ClockCircleOutlined /> },
];

const App = () => (
  <>
    {variants.map((variant) => (
      <div key={variant}>
        <Divider titlePlacement="start">Status ({variant})</Divider>
        <Flex gap="small" align="center" wrap>
          {presets.map(({ status, icon }) => (
            <Tag key={status} color={status} icon={icon} variant={variant}>
              {status}
            </Tag>
          ))}
        </Flex>
      </div>
    ))}
  </>
);

export default App;
