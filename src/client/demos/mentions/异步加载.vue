<script lang="tsx" setup>
import { Mentions } from '@/components';
import { debounce } from 'lodash-es';
import { h, ref } from 'vue';

const loading = ref(false);
const users = ref<{ login: string; avatar_url: string }[]>([]);
const domRef = ref<string>(null);

const loadGithubUsers = (key: string) => {
  if (!key) {
    users.value = [];
    return;
  }

  fetch(`https://api.github.com/search/users?q=${key}`)
    .then((res) => res.json())
    .then(({ items = [] }) => {
      if (domRef.value !== key) return;

      loading.value = false;
      users.value = items.slice(0, 10);
    });
};

const debounceLoadGithubUsers = debounce(loadGithubUsers, 800);

const onSearch = (search: string) => {
  console.log('Search:', search);
  domRef.value = search;
  loading.value = !!search;
  users.value = [];

  debounceLoadGithubUsers(search);
};
</script>
<template>
  <Mentions
    class="!w-full"
    :loading="loading"
    @search="onSearch"
    :options="
      users.map(({ login, avatar_url: avatar }) => ({
        key: login,
        value: login,
        label: [h('img', { draggable: false, src: avatar, alt: login, style: { width: '20px' } }), h('span', {}, login)],
      }))
    "
  />
</template>
