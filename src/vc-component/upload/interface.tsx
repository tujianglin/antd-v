import type { CSSProperties } from 'vue';

export type BeforeUploadFileType = File | Blob | boolean | string;

export type Action = string | ((file: RcFile) => string | PromiseLike<string>);
// extends /** @vue-ignore */ Omit<InputHTMLAttributes, 'onError' | 'onProgress'>
export interface UploadProps {
  name?: string;
  style?: CSSProperties;
  class?: string;
  disabled?: boolean;
  component?: any;
  action?: Action;
  method?: UploadRequestMethod;
  folder?: boolean;
  data?: Record<string, unknown> | ((file: RcFile | string | Blob) => Record<string, unknown>);
  headers?: UploadRequestHeader;
  accept?: string;
  multiple?: boolean;
  onBatchStart?: (fileList: { file: RcFile; parsedFile: Exclude<BeforeUploadFileType, boolean> }[]) => void;
  onStart?: (file: RcFile) => void;
  onError?: (error: Error, ret: Record<string, unknown>, file: RcFile) => void;
  onSuccess?: (response: Record<string, unknown>, file: RcFile, xhr: XMLHttpRequest) => void;
  onProgress?: (event: UploadProgressEvent, file: RcFile) => void;
  beforeUpload?: (file: RcFile, FileList: RcFile[]) => BeforeUploadFileType | Promise<BeforeUploadFileType>;
  customRequest?: (option: UploadRequestOption) => { abort: () => void };
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  prefixCls?: string;
  id?: string;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent | KeyboardEvent) => void;
  classNames?: {
    input?: string;
  };
  styles?: {
    input?: CSSProperties;
  };
  hasControlInside?: boolean;
  pastable?: boolean;
}

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number;
}

export type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';

export type UploadRequestHeader = Record<string, string>;

export type UploadRequestFile = Exclude<BeforeUploadFileType, File | boolean> | RcFile;

export interface UploadRequestError extends Error {
  status?: number;
  method?: UploadRequestMethod;
  url?: string;
}

export interface UploadRequestOption<T = any> {
  onProgress?: (event: UploadProgressEvent, file?: UploadRequestFile) => void;
  onError?: (event: UploadRequestError | ProgressEvent, body?: T) => void;
  onSuccess?: (body: T, fileOrXhr?: UploadRequestFile | XMLHttpRequest) => void;
  data?: Record<string, unknown>;
  filename?: string;
  file: UploadRequestFile;
  withCredentials?: boolean;
  action: string;
  headers?: UploadRequestHeader;
  method: UploadRequestMethod;
}

export interface RcFile extends File {
  uid: string;
}
