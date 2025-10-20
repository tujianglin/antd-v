import { Button, Drawer, theme } from '@/components';
import type { CSSProperties } from 'vue';

const App = () => {
  const { token } = theme.useToken();

  const containerStyle: CSSProperties = {
    position: 'relative',
    height: '200px',
    padding: `${48}px`,
    overflow: 'hidden',
    background: token.value.colorFillAlter,
    border: `1px solid ${token.value.colorBorderSecondary}`,
    borderRadius: token.value.borderRadiusLG,
  };

  return (
    <div style={containerStyle}>
      Render in this
      <div style={{ marginTop: '16px' }}>
        <Button type="primary">Open</Button>
      </div>
      <Drawer title="Basic Drawer" open placement="right" closable={false} getContainer={false}>
        <p>Some contents...</p>
      </Drawer>
      {/* <Drawer title="Basic Drawer" open placement="right" closable={false}>
        <p>Some contents...</p>
      </Drawer> */}
    </div>
  );
};

export default App;
