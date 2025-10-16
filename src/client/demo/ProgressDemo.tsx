import { Flex, Progress, Tooltip, type ProgressProps } from '@/components';
import { green, red } from '@ant-design/colors';
import { defineComponent } from 'vue';

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};

const conicColors: ProgressProps['strokeColor'] = {
  '0%': '#87d068',
  '50%': '#ffe58f',
  '100%': '#ffccc7',
};

export default defineComponent({
  setup() {
    return () => (
      <>
        <Flex gap="small" vertical>
          <Progress percent={30} />
          <Progress percent={50} status="active" />
          <Progress percent={70} status="exception" />
          <Progress percent={100} />
          <Progress percent={50} showInfo={false} />
        </Flex>
        <Flex gap="small" wrap>
          <Progress type="circle" percent={75} />
          <Progress type="circle" percent={70} status="exception" />
          <Progress type="circle" percent={100} />
        </Flex>
        <Flex vertical gap="small" style={{ width: 180 }}>
          <Progress percent={30} size="small" />
          <Progress percent={50} size="small" status="active" />
          <Progress percent={70} size="small" status="exception" />
          <Progress percent={100} size="small" />
        </Flex>
        <Flex align="center" gap="small">
          <Progress
            type="circle"
            railColor="#e6f4ff"
            percent={60}
            strokeWidth={20}
            size={14}
            format={(number) => `进行中，已完成${number}%`}
          />
          <span>代码发布</span>
        </Flex>
        <Flex wrap gap="small">
          <Progress type="circle" percent={30} size={80} />
          <Progress type="circle" percent={70} size={80} status="exception" />
          <Progress type="circle" percent={100} size={80} />
        </Flex>
        <Flex vertical gap="middle">
          <Progress percent={99.9} strokeColor={twoColors} />
          <Progress percent={50} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
          <Flex gap="small" wrap>
            <Progress type="circle" percent={90} strokeColor={twoColors} />
            <Progress type="circle" percent={100} strokeColor={twoColors} />
            <Progress type="circle" percent={93} strokeColor={conicColors} />
          </Flex>
          <Flex gap="small" wrap>
            <Progress type="dashboard" percent={90} strokeColor={twoColors} />
            <Progress type="dashboard" percent={100} strokeColor={twoColors} />
            <Progress type="dashboard" percent={93} strokeColor={conicColors} />
          </Flex>
          <Flex gap="small" vertical>
            <Progress percent={50} steps={3} />
            <Progress percent={30} steps={5} />
            <Progress percent={100} steps={5} size="small" strokeColor={green[6]} />
            <Progress percent={60} steps={5} strokeColor={[green[6], green[6], red[5]]} />
          </Flex>
          <Flex gap="small" vertical>
            <Progress percent={0} percentPosition={{ align: 'center', type: 'inner' }} size={[200, 20]} strokeColor="#E6F4FF" />
            <Progress percent={10} percentPosition={{ align: 'center', type: 'inner' }} size={[300, 20]} />
            <Progress percent={50} percentPosition={{ align: 'start', type: 'inner' }} size={[300, 20]} strokeColor="#B7EB8F" />
            <Progress percent={60} percentPosition={{ align: 'end', type: 'inner' }} size={[300, 20]} strokeColor="#001342" />
            <Progress percent={100} percentPosition={{ align: 'center', type: 'inner' }} size={[400, 20]} />
            <Progress percent={60} percentPosition={{ align: 'start', type: 'outer' }} />
            <Progress percent={100} percentPosition={{ align: 'start', type: 'outer' }} />
            <Progress percent={60} percentPosition={{ align: 'center', type: 'outer' }} size="small" />
            <Progress percent={100} percentPosition={{ align: 'center', type: 'outer' }} />
          </Flex>
          <Flex vertical gap="middle">
            <Flex vertical gap="small" style={{ width: 300 }}>
              <Progress percent={50} />
              <Progress percent={50} size="small" />
              <Progress percent={50} size={[300, 20]} />
            </Flex>
            <Flex align="center" wrap gap={30}>
              <Progress type="circle" percent={50} />
              <Progress type="circle" percent={50} size="small" />
              <Progress type="circle" percent={50} size={20} />
            </Flex>
            <Flex align="center" wrap gap={30}>
              <Progress type="dashboard" percent={50} />
              <Progress type="dashboard" percent={50} size="small" />
              <Progress type="dashboard" percent={50} size={20} />
            </Flex>
            <Flex align="center" wrap gap={30}>
              <Progress steps={3} percent={50} />
              <Progress steps={3} percent={50} size="small" />
              <Progress steps={3} percent={50} size={20} />
              <Progress steps={3} percent={50} size={[20, 30]} />
            </Flex>
          </Flex>
        </Flex>
        <Flex gap="small" vertical>
          <Tooltip title="3 done / 3 in progress / 4 to do">
            <Progress percent={60} success={{ percent: 30 }} />
          </Tooltip>
          <Flex gap="small" wrap>
            <Tooltip title="3 done / 3 in progress / 4 to do">
              <Progress percent={60} success={{ percent: 30 }} type="circle" />
            </Tooltip>
            <Tooltip title="3 done / 3 in progress / 4 to do">
              <Progress percent={60} success={{ percent: 30 }} type="dashboard" />
            </Tooltip>
          </Flex>
        </Flex>
      </>
    );
  },
});
