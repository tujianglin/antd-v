import type { Dayjs } from 'dayjs';
import type { Component, VNode } from 'vue';
import type { JSX } from 'vue/jsx-runtime';

export type VueKey = string | number;

export type VueNode = VNode | string | number | null | undefined | (() => VNode) | Component | JSX.Element;

export type AnyObject = Record<VueKey, any>;

export type DateType = Dayjs;
