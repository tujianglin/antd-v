import { Button, Result } from '@/components';
import { SmileOutlined } from '@ant-design/icons-vue';

const App = () => (
  <Result icon={<SmileOutlined />} title="Great, we have done all the operations!" extra={<Button type="primary">Next</Button>} />
);

export default App;
