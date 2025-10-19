import { QRCode, Space, theme } from '@/components';

const App = () => {
  const { useToken } = theme;
  const { token } = useToken();

  return (
    <Space>
      <QRCode value="https://ant.design/" color={token.value.colorSuccessText} />
      <QRCode value="https://ant.design/" color={token.value.colorInfoText} bgColor={token.value.colorBgLayout} />
    </Space>
  );
};

export default App;
