import type { NotificationAPI, NotificationConfig } from './hooks/useNotification';
import useNotification from './hooks/useNotification';
import Notice from './Notice.vue';
import { useNotificationContextInject } from './NotificationProvider';

export { Notice, useNotification, useNotificationContextInject };
export type { NotificationAPI, NotificationConfig };
