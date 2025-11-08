<script lang="tsx">
import { Button, Segmented, Space, Switch, Table, Typography, type TableProps } from '@/components';
import { computed, defineComponent, ref } from 'vue';

interface RecordType {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  address1: string;
  address2: string;
  address3: string;
}

const fixedColumns: TableProps<RecordType>['columns'] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
    fixed: 'start',
  },
  {
    title: 'FistName',
    dataIndex: 'firstName',
    width: 120,
    fixed: 'start',
  },
  {
    title: 'LastName',
    dataIndex: 'lastName',
    width: 120,
    fixed: 'start',
  },
  {
    title: 'Group',
    width: 120,
    render: (_, record) => `Group ${Math.floor(record.id / 4)}`,
    onCell: (record) => {
      return {
        rowspan: record.id % 4 === 0 ? 4 : 0,
      };
    },
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 100,
    onCell: (record) => ({
      colspan: record.id % 4 === 0 ? 2 : 1,
    }),
  },
  {
    title: 'Address 1',
    dataIndex: 'address1',
    onCell: (record) => ({
      colspan: record.id % 4 === 0 ? 0 : 1,
    }),
  },
  {
    title: 'Address 2',
    dataIndex: 'address2',
  },
  {
    title: 'Address 3',
    dataIndex: 'address3',
  },
  {
    title: 'Action',
    width: 150,
    fixed: 'end',
    render: () => (
      <Space>
        <Typography.Link>Action1</Typography.Link>
        <Typography.Link>Action2</Typography.Link>
      </Space>
    ),
  },
];

const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: 'FistName',
    dataIndex: 'firstName',
    width: 120,
  },
  {
    title: 'LastName',
    dataIndex: 'lastName',
  },
];

const getData = (length: number) =>
  Array.from({ length }).map<RecordType>((_, index) => ({
    id: index,
    firstName: `First_${index.toString(16)}`,
    lastName: `Last_${index.toString(16)}`,
    age: 25 + (index % 10),
    address1: `New York No. ${index} Lake Park`,
    address2: `London No. ${index} Lake Park`,
    address3: `Sydney No. ${index} Lake Park`,
  }));
export default defineComponent({
  setup() {
    const fixed = ref(true);
    const bordered = ref(true);
    const expanded = ref(true);
    const empty = ref(false);
    const count = ref(40);

    const tblRef = ref(null);

    const data = computed<RecordType[]>(() => getData(count.value));

    const mergedColumns = computed<typeof fixedColumns>(() => {
      if (!fixed.value) {
        return columns;
      }

      if (!expanded.value) {
        return fixedColumns;
      }

      return fixedColumns.map((col) => ({ ...col, onCell: undefined }));
    });

    const expandableProps = computed<TableProps<RecordType>['expandable']>(() => {
      if (!expanded.value) {
        return undefined;
      }

      return {
        columnWidth: 48,
        expandedRowRender: (record) => <p style={{ margin: 0 }}>🎉 Expanded {record.address1}</p>,
        rowExpandable: (record) => record.id % 2 === 0,
      };
    });
    return () => {
      return (
        <div style={{ padding: '64px' }}>
          <Space vertical style={{ width: '100%' }}>
            <Space>
              <Switch v-model:value={bordered.value} checkedChildren="Bordered" unCheckedChildren="Bordered" />
              <Switch v-model:value={fixed.value} checkedChildren="Fixed" unCheckedChildren="Fixed" />
              <Switch v-model:value={expanded.value} checkedChildren="Expandable" unCheckedChildren="Expandable" />
              <Switch v-model:value={empty.value} checkedChildren="Empty" unCheckedChildren="Empty" />
              <Segmented
                v-model:value={count.value}
                options={[
                  { label: 'None', value: 0 },
                  { label: 'Less', value: 4 },
                  { label: 'Lot', value: 10000 },
                ]}
              />

              {data.value.length >= 999 && (
                <Button
                  onClick={() => {
                    console.log(tblRef.value);
                    tblRef.value?.scrollTo({ index: 999 });
                  }}
                >
                  Scroll To index 999
                </Button>
              )}
            </Space>

            <Table
              bordered={bordered.value}
              // virtual
              columns={mergedColumns.value}
              scroll={{ x: 2000, y: 400 }}
              rowKey="id"
              dataSource={empty.value ? [] : data.value}
              pagination={false}
              ref={tblRef}
              rowSelection={expanded.value ? undefined : { type: 'radio', columnWidth: 48 }}
              expandable={expandableProps.value}
            />
          </Space>
        </div>
      );
    };
  },
});
</script>
