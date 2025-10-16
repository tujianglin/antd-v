import { Button, message, Space } from '@/components';

const App = () => {
  const info = () => {
    message.info('This is a normal message');
  };

  return (
    <>
      <Space>
        <Button type="primary" onClick={info}>
          Static Method
        </Button>
      </Space>
    </>
  );
};

export default App;
