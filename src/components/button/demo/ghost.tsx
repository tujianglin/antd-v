import { Button, Flex } from '@/components';

const App = () => (
  <Flex wrap gap="small" class="bg-[#bec8c8] !p-4">
    <Button type="primary" ghost>
      Primary
    </Button>
    <Button ghost>Default</Button>
    <Button type="dashed" ghost>
      Dashed
    </Button>
    <Button type="primary" danger ghost>
      Danger
    </Button>
  </Flex>
);

export default App;
