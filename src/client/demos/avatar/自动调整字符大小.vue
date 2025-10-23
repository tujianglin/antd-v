<script lang="tsx" setup>
import { Avatar, Button } from '@/components';
import { ref } from 'vue';

const UserList = ['U', 'Lucy', 'Tom', 'Edward'];
const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
const GapList = [4, 3, 2, 1];

const user = ref(UserList[0]);
const color = ref(ColorList[0]);
const gap = ref(GapList[0]);

const changeUser = () => {
  const index = UserList.indexOf(user.value);
  user.value = index < UserList.length - 1 ? UserList[index + 1] : UserList[0];
  color.value = index < ColorList.length - 1 ? ColorList[index + 1] : ColorList[0];
};

const changeGap = () => {
  const index = GapList.indexOf(gap.value);
  gap.value = index < GapList.length - 1 ? GapList[index + 1] : GapList[0];
};
</script>
<template>
  <Avatar :style="{ backgroundColor: color, verticalAlign: 'middle' }" size="large" :gap="gap"> {{ user }} </Avatar>
  <Button size="small" :style="{ margin: '0 16px', verticalAlign: 'middle' }" @click="changeUser"> ChangeUser </Button>
  <Button size="small" :style="{ verticalAlign: 'middle' }" @click="changeGap"> changeGap </Button>
</template>
