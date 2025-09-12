import type { Component, VNode } from 'vue';

export type VueKey = string | number;

export type VueNode = VNode | string | number | null | undefined | (() => VNode) | Component;
