import type { Dayjs } from 'dayjs';
import type { Component, VNode } from 'vue';

export type VueKey = string | number;

export type VueNode = VNode | string | number | null | undefined | (() => VNode) | Component;

export type AnyObject = Record<VueKey, any>;

export type DateType = Dayjs;
