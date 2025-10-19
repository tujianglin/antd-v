import type { Component, VNode } from 'vue';

export type VueKey = string | number;

export type VueNode = VNode | string | number | null | undefined | ((e?: any) => VNode) | Component;

export type AnyObject = Record<VueKey, any>;
