<script lang="tsx" setup>
import { effect, h, onMounted, ref } from 'vue';
import { Option } from '..';
import Select from '../Select.vue';

const textareaRef = ref();
const disabled = ref(false);
const value = ref('');
const options = ref([]);
let timeoutId = null;

onMounted(() => {
  console.log('Ref:', textareaRef.value);
});

const onChange = (val, option) => {
  console.log('onChange', val, option);
  value.value = val;
};

const onKeyDown = (e) => {
  if (e.keyCode === 13) {
    console.log('onEnter', value.value);
  }
};

const onSelect = (v, option) => {
  console.log('onSelect', v, option);
};

const onSearch = (text: string) => {
  console.log('onSearch:', text);
};

const onAsyncChange = (value) => {
  clearTimeout(timeoutId);

  options.value = [];

  timeoutId = setTimeout(() => {
    options.value = [{ value }, { value: `${value}-${value}` }];
  }, 1000);
};

effect(() => {
  console.log(options.value);
});

const toggleDisabled = () => {
  disabled.value = !disabled.value;
};
</script>
<template>
  <div>
    <h2>combobox</h2>
    <p>
      <button type="button" @click="toggleDisabled">toggle disabled</button>
      <button type="button" @click="value = ''">reset</button>
    </p>
    <Select
      mode="combobox"
      @change="onChange"
      v-model:value="value"
      :show-search="{
        filterOption: (inputValue, option) => {
            if (!inputValue) {
              return true;
            }
            return (option.value as string).includes(inputValue);
          },
      }"
    >
      <Option v-for="item in ['1', '2', '3']" :key="item" :value="item">{{ item }}</Option>
    </Select>
    <div>
      <Select
        :disabled="disabled"
        :style="{ width: '500px' }"
        @change="onChange"
        @select="onSelect"
        @input-key-down="onKeyDown"
        :show-search="{ onSearch }"
        not-found-content=""
        allow-clear
        placeholder="please input, max len: 10"
        v-model:value="value"
        :maxlength="10"
        mode="combobox"
        backfill
        @focus="() => console.log('focus')"
        @blur="() => console.log('blur')"
      >
        <Option value="jack">
          <b style="color: red">jack</b>
        </Option>
        <Option value="lucy">lucy</Option>
        <Option value="disabled" disabled> disabled </Option>
        <Option value="yiminghe">yiminghe</Option>
        <Option value="竹林星光">竹林星光</Option>
      </Select>
      <h3>Customize Input Element</h3>
      <Select
        mode="combobox"
        style="width: 200px"
        :get-input-element="() => h('textarea', { style: { background: 'red' }, rows: 3, ref: textareaRef })"
        :options="[{ value: 'light' }, { value: 'bamboo' }]"
        allow-clear
        placeholder="2333"
      />
      <h3>Async Input Element</h3>
      <Select
        v-model:value="value"
        mode="combobox"
        :not-found-content="null"
        :style="{ width: `${200}px` }"
        :options="options"
        @change="onAsyncChange"
      />
    </div>
  </div>
</template>
