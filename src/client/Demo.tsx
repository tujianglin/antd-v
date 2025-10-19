import type { StepsProps } from '@/components';
import { Flex, Steps } from '@/components';
import theme from '@/components/theme';

const items: StepsProps['items'] = Array.from({ length: 5 }, (_, index) => ({
  title: `Step ${index + 1}`,
  subTitle: 'Sub Title',
  content: `This is Step ${index + 1}`,
}));

const App = () => {
  const { token } = theme.useToken();

  return (
    <Flex vertical>
      <Steps type="inline" current={1} items={items} />
      <Steps
        type="inline"
        current={4}
        items={items}
        status="finish"
        styles={{
          itemTitle: {
            color: token.value.colorPrimaryText,
          },
          itemSubtitle: {
            color: token.value.colorPrimaryTextActive,
          },
          itemRail: {
            background: token.value.colorTextDisabled,
          },
        }}
      />
      <Steps type="inline" current={1} items={items.slice(2)} offset={2} />
    </Flex>
  );
};

export default App;
