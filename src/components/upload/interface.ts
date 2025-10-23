import type {
  RcFile as OriRcFile,
  UploadRequestOption as RcCustomRequestOptions,
  UploadProps as RcUploadProps,
} from '@/vc-component/upload/interface';
import type { VueNode } from '@/vc-util/type';
import type { CSSProperties, ImgHTMLAttributes } from 'vue';
import type { ProgressAriaProps, ProgressProps } from '../progress';

export interface RcFile extends OriRcFile {
  readonly lastModifiedDate: Date;
}

export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'removed';

export interface HttpRequestHeader {
  [key: string]: string;
}

export interface UploadFile<T = any> extends ProgressAriaProps {
  uid: string;
  size?: number;
  name: string;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  url?: string;
  status?: UploadFileStatus;
  percent?: number;
  thumbUrl?: string;
  crossorigin?: ImgHTMLAttributes['crossorigin'];
  originFileObj?: RcFile;
  response?: T;
  error?: any;
  linkProps?: any;
  type?: string;
  xhr?: T;
  preview?: string;
}

export interface InternalUploadFile<T = any> extends UploadFile<T> {
  originFileObj: RcFile;
}

export interface UploadChangeParam<T = UploadFile> {
  // https://github.com/ant-design/ant-design/issues/14420
  file: T;
  fileList: T[];
  event?: { percent: number };
}

export interface ShowUploadListInterface<T = any> {
  extra?: VueNode | ((file: UploadFile<T>) => VueNode);
  showRemoveIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showPreviewIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showDownloadIcon?: boolean | ((file: UploadFile<T>) => boolean);
  removeIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
  downloadIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
  previewIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
}

export interface UploadLocale {
  uploading?: string;
  removeFile?: string;
  downloadFile?: string;
  uploadError?: string;
  previewFile?: string;
}

export type UploadType = 'drag' | 'select';
export type UploadListType = 'text' | 'picture' | 'picture-card' | 'picture-circle';
export type UploadListProgressProps = Omit<ProgressProps, 'percent' | 'type'>;

export type ItemRender<T = any> = (
  originNode: VueNode,
  file: UploadFile<T>,
  fileList: Array<UploadFile<T>>,
  actions: {
    download: () => void;
    preview: () => void;
    remove: () => void;
  },
) => VueNode;

type PreviewFileHandler = (file: File | Blob) => PromiseLike<string>;
type BeforeUploadValueType = boolean | string | Blob | File;

export type SemanticName = 'root' | 'list' | 'item';
export interface UploadProps<T = any> extends Pick<RcUploadProps, 'hasControlInside' | 'pastable'> {
  type?: UploadType;
  name?: string;
  action?: string | ((file: RcFile) => string) | ((file: RcFile) => PromiseLike<string>);
  webkitdirectory?: boolean;
  data?: Record<string, unknown> | ((file: UploadFile<T>) => Record<string, unknown> | Promise<Record<string, unknown>>);
  method?: 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';
  headers?: HttpRequestHeader;
  showUploadList?: boolean | ShowUploadListInterface<T>;
  multiple?: boolean;
  accept?: string;
  beforeUpload?: (file: RcFile, fileList: RcFile[]) => BeforeUploadValueType | Promise<BeforeUploadValueType>;
  onChange?: (info: UploadChangeParam<UploadFile<T>>) => void;
  onDrop?: (event: DragEvent) => void;
  listType?: UploadListType;
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  rootClassName?: string;
  onPreview?: (file: UploadFile<T>) => void;
  onDownload?: (file: UploadFile<T>) => void;
  onRemove?: (file: UploadFile<T>) => boolean | Promise<boolean>;
  supportServerRender?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  prefixCls?: string;
  customRequest?: (options: RcCustomRequestOptions<T>) => void;
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  locale?: UploadLocale;
  id?: string;
  previewFile?: PreviewFileHandler;
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => VueNode;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  progress?: UploadListProgressProps;
  itemRender?: ItemRender<T>;
  fileList?: UploadFile<T>[];
  /** Config max count of `fileList`. Will replace current one when `maxCount` is 1 */
  maxCount?: number;
}

export interface UploadState<T = any> {
  fileList: UploadFile<T>[];
  dragState: string;
}

export interface UploadListProps<T = any> {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  listType?: UploadListType;
  onPreview?: (file: UploadFile<T>) => void;
  onDownload?: (file: UploadFile<T>) => void;
  onRemove?: (file: UploadFile<T>) => void;
  items?: Array<UploadFile<T>>;
  progress?: UploadListProgressProps;
  prefixCls?: string;
  className?: string;
  showRemoveIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showDownloadIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showPreviewIcon?: boolean | ((file: UploadFile<T>) => boolean);
  removeIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
  downloadIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
  previewIcon?: VueNode | ((file: UploadFile<T>) => VueNode);
  extra?: VueNode | ((file: UploadFile<T>) => VueNode);
  locale: UploadLocale;
  previewFile?: PreviewFileHandler;
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => VueNode;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  appendAction?: VueNode;
  appendActionVisible?: boolean;
  itemRender?: ItemRender<T>;
  /**
   * @internal Only the internal remove button is provided for use
   */
  disabled?: boolean;
}
