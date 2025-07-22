import { Button, Flex } from '@/components';

const App = () => (
  <Flex gap="small" wrap>
    <Button type="primary" autoInsertSpace={false}>
      确定
    </Button>
    <Button type="primary" autoInsertSpace>
      确定
    </Button>
  </Flex>
);

export default App;
