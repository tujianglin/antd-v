<script lang="tsx" setup>
import { Anchor } from '@/components';

const getCurrentAnchor = () => '#anchor-demo-static';
</script>
<template>
  <Anchor
    :affix="false"
    :get-current-anchor="getCurrentAnchor"
    :items="[
      {
        key: '1',
        href: '#anchor-demo-basic',
        title: 'Basic demo',
      },
      {
        key: '2',
        href: '#anchor-demo-static',
        title: 'Static demo',
      },
      {
        key: '3',
        href: '#api',
        title: 'API',
        children: [
          {
            key: '4',
            href: '#anchor-props',
            title: 'Anchor Props',
          },
          {
            key: '5',
            href: '#link-props',
            title: 'Link Props',
          },
        ],
      },
    ]"
  />
</template>
