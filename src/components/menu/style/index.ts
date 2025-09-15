import type { CSSObject } from '@/vc-cssinjs';
import { unit } from '@/vc-cssinjs';
import { FastColor } from '@ant-design/fast-color';
import type { CSSProperties, Ref } from 'vue';

import { clearFix, resetComponent, resetIcon } from '../../style';
import { genCollapseMotion, initSlideMotion, initZoomMotion } from '../../style/motion';
import type { CSSUtil, FullToken, GenerateStyle, GetDefaultToken } from '../../theme/internal';
import { genStyleHooks, mergeToken } from '../../theme/internal';
import getHorizontalStyle from './horizontal';
import getRTLStyle from './rtl';
import getThemeStyle from './theme';
import getVerticalStyle from './vertical';

/** Component only token. Which will handle additional calculation of alias token */
export interface ComponentToken {
  /**
   * @desc 弹出菜单的宽度
   * @descEN Width of popup menu
   */
  dropdownWidth: number | string;
  /**
   * @desc 弹出菜单的 z-index
   * @descEN z-index of popup menu
   */
  zIndexPopup: number;

  // Group
  /**
   * @desc 分组标题文字颜色
   * @descEN Color of group title text
   */
  groupTitleColor: string;
  /**
   * @desc 分组标题文字高度
   * @descEN line-height of group title
   */
  groupTitleLineHeight: string | number;
  /**
   * @desc 分组标题文字大小
   * @descEN font-size of group title
   */
  groupTitleFontSize: number;

  // radius
  /**
   * @desc 菜单项的圆角
   * @descEN Radius of menu item
   */
  itemBorderRadius: number;

  /**
   * @desc 子菜单项的圆角
   * @descEN Radius of sub-menu item
   */
  subMenuItemBorderRadius: number;

  // Item Text
  // > Default
  /**
   * @desc 菜单项文字颜色
   * @descEN Color of menu item text
   */
  itemColor: string;

  /**
   * @desc 菜单项文字悬浮颜色
   * @descEN Hover color of menu item text
   */
  itemHoverColor: string;
  /**
   * @desc 水平菜单项文字悬浮颜色
   * @descEN Hover color of horizontal menu item text
   */
  horizontalItemHoverColor: string;

  /**
   * @desc 菜单项文字选中颜色
   * @descEN Color of selected menu item text
   */
  itemSelectedColor: string;
  /**
   * @desc 子菜单内有选中项时，子菜单标题色
   * @descEN Color of submenu title when submenu has selected item
   */
  subMenuItemSelectedColor: string;

  /**
   * @desc 水平菜单项文字选中颜色
   * @descEN Color of selected horizontal menu item text
   */
  horizontalItemSelectedColor: string;

  // > Disabled
  /**
   * @desc 菜单项文字禁用颜色
   * @descEN Color of disabled menu item text
   */
  itemDisabledColor: string;

  // > Danger
  /**
   * @desc 危险菜单项文字颜色
   * @descEN Color of danger menu item text
   */
  dangerItemColor: string;
  /**
   * @desc 危险菜单项文字悬浮颜色
   * @descEN Hover color of danger menu item text
   */
  dangerItemHoverColor: string;
  /**
   * @desc 危险菜单项文字选中颜色
   * @descEN Color of selected danger menu item text
   */
  dangerItemSelectedColor: string;
  /**
   * @desc 危险菜单项激活态背景色
   * @descEN Background color of danger menu item when active
   */
  dangerItemActiveBg: string;

  /**
   * @desc 危险菜单项选中背景色
   * @descEN Background color of selected danger menu item
   */
  dangerItemSelectedBg: string;

  // Item Bg
  /**
   * @desc 菜单项背景色
   */
  itemBg: string;

  /**
   * @desc 菜单项悬浮态背景色
   * @descEN Background color of menu item when hover
   */
  itemHoverBg: string;

  /**
   * @desc 子菜单项背景色
   * @descEN Background color of sub-menu item
   */
  subMenuItemBg: string;

  // > Default
  /**
   * @desc 菜单项激活态背景色
   * @descEN Background color of menu item when active
   */
  itemActiveBg: string;

  /**
   * @desc 菜单项选中态背景色
   * @descEN Background color of menu item when selected
   */
  itemSelectedBg: string;

  /**
   * @desc 水平菜单项选中态背景色
   * @descEN Background color of horizontal menu item when selected
   */
  horizontalItemSelectedBg: string;
  /**
   * @desc 菜单项指示条宽度
   * @descEN Width of menu item active bar
   */
  activeBarWidth: number | string;

  /**
   * @desc 菜单项指示条高度
   * @descEN Height of menu item active bar
   */
  activeBarHeight: number;

  /**
   * @desc 菜单项指示条边框宽度
   * @descEN Border width of menu item active bar
   */
  activeBarBorderWidth: number | string;

  /**
   * @desc 菜单项横向外间距
   * @descEN Horizontal margin of menu item
   */
  itemMarginInline: number;
  /**
   * @desc 横向菜单项横悬浮态背景色
   * @descEN Background color of horizontal menu item when hover
   */
  horizontalItemHoverBg: string;
  /**
   * @desc 横向菜单项圆角
   * @descEN Border radius of horizontal menu item
   */
  horizontalItemBorderRadius: number;
  /**
   * @desc 菜单项高度
   * @descEN Height of menu item
   */
  itemHeight: number | string;
  /**
   * @desc 收起后的宽度
   * @descEN Width when collapsed
   */
  collapsedWidth: number | string;
  /**
   * @desc 弹出框背景色
   * @descEN Background color of popup
   */
  popupBg: string;
  /**
   * @desc 菜单项纵向外间距
   * @descEN margin-block of menu item
   */
  itemMarginBlock: CSSProperties['marginBlock'];
  /**
   * @desc 菜单项横向内间距
   * @descEN padding-inline of menu item
   */
  itemPaddingInline: CSSProperties['paddingInline'];
  /**
   * @desc 横向菜单行高
   * @descEN LineHeight of horizontal menu item
   */
  horizontalLineHeight: CSSProperties['lineHeight'];
  /**
   * @desc 图标与文字间距
   * @descEN Spacing between icon and text
   */
  iconMarginInlineEnd: CSSProperties['marginInlineEnd'];
  /**
   * @desc 图标尺寸
   * @descEN Size of icon
   */
  iconSize: number;
  /**
   * @desc 收起时图标尺寸
   * @descEN Size of icon when collapsed
   */
  collapsedIconSize: number;

  // Dark
  /**
   * @desc 暗色模式下的浮层菜单的背景颜色
   * @descEN The background color of the overlay menu in dark mode.
   */
  darkPopupBg: string;
  /**
   * @desc 暗色模式下的菜单项文字颜色
   * @descEN Color of menu item text in dark mode
   */
  darkItemColor: string;
  /**
   * @desc 暗色模式下的危险菜单项文字颜色
   * @descEN Color of danger menu item text in dark mode
   */
  darkDangerItemColor: string;
  /**
   * @desc 暗色模式下的菜单项背景
   * @descEN Background of menu item in dark mode
   */
  darkItemBg: string;
  /**
   * @desc 暗色模式下的子菜单项背景
   * @descEN Background of submenu item in dark mode
   */
  darkSubMenuItemBg: string;
  /**
   * @desc 暗色模式下的菜单项选中颜色
   * @descEN Color of selected menu item in dark mode
   */
  darkItemSelectedColor: string;
  /**
   * @desc 暗色模式下的菜单项选中背景
   * @descEN Background of active menu item in dark mode
   */
  darkItemSelectedBg: string;
  /**
   * @desc 暗色模式下的菜单项悬浮背景
   * @descEN Background of hovered menu item in dark mode
   */
  darkItemHoverBg: string;
  /**
   * @desc 暗色模式下的分组标题文字颜色
   * @descEN Color of group title text in dark mode
   */
  darkGroupTitleColor: string;
  /**
   * @desc 暗色模式下的菜单项悬浮颜色
   * @descEN Color of hovered menu item in dark mode
   */
  darkItemHoverColor: string;
  /**
   * @desc 暗色模式下的菜单项禁用颜色
   * @descEN Color of disabled menu item in dark mode
   */
  darkItemDisabledColor: string;
  /**
   * @desc 暗色模式下的危险菜单项选中背景
   * @descEN Background of active danger menu item in dark mode
   */
  darkDangerItemSelectedBg: string;
  /**
   * @desc 暗色模式下的危险菜单项悬浮文字背景
   * @descEN Background of hovered danger menu item in dark mode
   */
  darkDangerItemHoverColor: string;
  /**
   * @desc 暗色模式下的危险菜单项选中文字颜色
   * @descEN Color of selected danger menu item in dark mode
   */
  darkDangerItemSelectedColor: string;
  /**
   * @desc 暗色模式下的危险菜单项激活态背景
   * @descEN Background of active danger menu item in dark mode
   */
  darkDangerItemActiveBg: string;
  /** @internal */
  itemWidth: number | string;
}

/**
 * @desc Menu 组件的 Token
 * @descEN Token for Menu component
 */
export interface MenuToken extends FullToken<'Menu'> {
  /**
   * @desc 水平菜单高度
   * @descEN Height of horizontal menu
   */
  menuHorizontalHeight: number | string;
  /**
   * @desc 菜单箭头尺寸
   * @descEN Size of menu arrow
   */
  menuArrowSize: number | string;
  /**
   * @desc 菜单箭头偏移量
   * @descEN Offset of menu arrow
   */
  menuArrowOffset: number | string;
  /**
   * @desc 子菜单背景色
   * @descEN Background color of sub-menu
   */
  menuSubMenuBg: string;
  /**
   * @desc 暗色模式下的浮层菜单背景色
   * @descEN Background color of popup menu in dark mode
   */
  darkPopupBg: string;
}

const genMenuItemStyle = (token: MenuToken): CSSObject => {
  const {
    componentCls,
    motionDurationSlow,
    motionDurationMid,
    motionEaseInOut,
    motionEaseOut,
    iconCls,
    iconSize,
    iconMarginInlineEnd,
  } = token;

  return {
    // >>>>> Item
    [`${componentCls}-item, ${componentCls}-submenu-title`]: {
      position: 'relative',
      display: 'block',
      margin: 0,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: [
        `border-color ${motionDurationSlow}`,
        `background ${motionDurationSlow}`,
        `padding calc(${motionDurationSlow} + 0.1s) ${motionEaseInOut}`,
      ].join(','),

      [`${componentCls}-item-icon, ${iconCls}`]: {
        minWidth: iconSize,
        fontSize: iconSize,
        transition: [
          `font-size ${motionDurationMid} ${motionEaseOut}`,
          `margin ${motionDurationSlow} ${motionEaseInOut}`,
          `color ${motionDurationSlow}`,
        ].join(','),

        '+ span': {
          marginInlineStart: iconMarginInlineEnd,
          opacity: 1,
          transition: [
            `opacity ${motionDurationSlow} ${motionEaseInOut}`,
            `margin ${motionDurationSlow}`,
            `color ${motionDurationSlow}`,
          ].join(','),
        },
      },

      [`${componentCls}-item-icon`]: {
        ...resetIcon(),
      },

      [`&${componentCls}-item-only-child`]: {
        [`> ${iconCls}, > ${componentCls}-item-icon`]: {
          marginInlineEnd: 0,
        },
      },
    },

    // Disabled state sets text to gray and nukes hover/tab effects
    [`${componentCls}-item-disabled, ${componentCls}-submenu-disabled`]: {
      background: 'none !important',
      cursor: 'not-allowed',

      '&::after': {
        borderColor: 'transparent !important',
      },

      a: {
        color: 'inherit !important',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },

      [`> ${componentCls}-submenu-title`]: {
        color: 'inherit !important',
        cursor: 'not-allowed',
      },
    },
  };
};

const genSubMenuArrowStyle = (token: MenuToken): CSSObject => {
  const { componentCls, motionDurationSlow, motionEaseInOut, borderRadius, menuArrowSize, menuArrowOffset } = token;

  return {
    [`${componentCls}-submenu`]: {
      '&-expand-icon, &-arrow': {
        position: 'absolute',
        top: '50%',
        insetInlineEnd: token.margin,
        width: menuArrowSize,
        color: 'currentcolor',
        transform: 'translateY(-50%)',
        transition: `transform ${motionDurationSlow} ${motionEaseInOut}, opacity ${motionDurationSlow}`,
      },

      '&-arrow': {
        // →
        '&::before, &::after': {
          position: 'absolute',
          width: token.calc(menuArrowSize).mul(0.6).equal(),
          height: token.calc(menuArrowSize).mul(0.15).equal(),
          backgroundColor: 'currentcolor',
          borderRadius,
          transition: [
            `background ${motionDurationSlow} ${motionEaseInOut}`,
            `transform ${motionDurationSlow} ${motionEaseInOut}`,
            `top ${motionDurationSlow} ${motionEaseInOut}`,
            `color ${motionDurationSlow} ${motionEaseInOut}`,
          ].join(','),
          content: '""',
        },

        '&::before': {
          transform: `rotate(45deg) translateY(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`,
        },

        '&::after': {
          transform: `rotate(-45deg) translateY(${unit(menuArrowOffset)})`,
        },
      },
    },
  };
};

// =============================== Base ===============================
const getBaseStyle: GenerateStyle<MenuToken> = (token) => {
  const {
    antCls,
    componentCls,
    fontSize,
    motionDurationSlow,
    motionDurationMid,
    motionEaseInOut,
    paddingXS,
    padding,
    colorSplit,
    lineWidth,
    zIndexPopup,
    borderRadiusLG,
    subMenuItemBorderRadius,
    menuArrowSize,
    menuArrowOffset,
    lineType,
    groupTitleLineHeight,
    groupTitleFontSize,
  } = token;

  return [
    // Misc
    {
      '': {
        [componentCls]: {
          ...clearFix(),

          // Hidden
          '&-hidden': {
            display: 'none',
          },
        },
      },
      [`${componentCls}-submenu-hidden`]: {
        display: 'none',
      },
    },
    {
      [componentCls]: {
        ...resetComponent(token),
        ...clearFix(),

        marginBottom: 0,
        paddingInlineStart: 0, // Override default ul/ol
        fontSize,
        lineHeight: 0, // Fix display inline-block gap
        listStyle: 'none',
        outline: 'none',
        // Magic cubic here but smooth transition
        transition: `width ${motionDurationSlow} cubic-bezier(0.2, 0, 0, 1) 0s`,

        'ul, ol': {
          margin: 0,
          padding: 0,
          listStyle: 'none',
        },

        // Overflow ellipsis
        '&-overflow': {
          display: 'flex',

          [`${componentCls}-item`]: {
            flex: 'none',
          },
        },
        [`${componentCls}-item, ${componentCls}-submenu, ${componentCls}-submenu-title`]: {
          borderRadius: token.itemBorderRadius,
        },

        [`${componentCls}-item-group-title`]: {
          padding: `${unit(paddingXS)} ${unit(padding)}`,
          fontSize: groupTitleFontSize,
          lineHeight: groupTitleLineHeight,
          transition: `all ${motionDurationSlow}`,
        },

        [`&-horizontal ${componentCls}-submenu`]: {
          transition: [
            `border-color ${motionDurationSlow} ${motionEaseInOut}`,
            `background ${motionDurationSlow} ${motionEaseInOut}`,
          ].join(','),
        },

        [`${componentCls}-submenu, ${componentCls}-submenu-inline`]: {
          transition: [
            `border-color ${motionDurationSlow} ${motionEaseInOut}`,
            `background ${motionDurationSlow} ${motionEaseInOut}`,
            `padding ${motionDurationMid} ${motionEaseInOut}`,
          ].join(','),
        },

        [`${componentCls}-submenu ${componentCls}-sub`]: {
          cursor: 'initial',
          transition: [
            `background ${motionDurationSlow} ${motionEaseInOut}`,
            `padding ${motionDurationSlow} ${motionEaseInOut}`,
          ].join(','),
        },

        [`${componentCls}-title-content`]: {
          transition: `color ${motionDurationSlow}`,

          '&-with-extra': {
            display: 'inline-flex',
            alignItems: 'center',
            width: '100%',
          },

          // https://github.com/ant-design/ant-design/issues/41143
          [`> ${antCls}-typography-ellipsis-single-line`]: {
            display: 'inline',
            verticalAlign: 'unset',
          },

          [`${componentCls}-item-extra`]: {
            marginInlineStart: 'auto',
            paddingInlineStart: token.padding,
          },
        },

        [`${componentCls}-item a`]: {
          '&::before': {
            position: 'absolute',
            inset: 0,
            backgroundColor: 'transparent',
            content: '""',
          },
        },

        // Removed a Badge related style seems it's safe
        // https://github.com/ant-design/ant-design/issues/19809

        // >>>>> Divider
        [`${componentCls}-item-divider`]: {
          overflow: 'hidden',
          lineHeight: 0,
          borderColor: colorSplit,
          borderStyle: lineType,
          borderWidth: 0,
          borderTopWidth: lineWidth,
          marginBlock: lineWidth,
          padding: 0,

          '&-dashed': {
            borderStyle: 'dashed',
          },
        },

        // Item
        ...genMenuItemStyle(token),

        [`${componentCls}-item-group`]: {
          [`${componentCls}-item-group-list`]: {
            margin: 0,
            padding: 0,

            [`${componentCls}-item, ${componentCls}-submenu-title`]: {
              paddingInline: `${unit(token.calc(fontSize).mul(2).equal())} ${unit(padding)}`,
            },
          },
        },

        // ======================= Sub Menu =======================
        '&-submenu': {
          '&-popup': {
            position: 'absolute',
            zIndex: zIndexPopup,
            borderRadius: borderRadiusLG,
            boxShadow: 'none',
            transformOrigin: '0 0',

            [`&${componentCls}-submenu`]: {
              background: 'transparent',
            },

            // https://github.com/ant-design/ant-design/issues/13955
            '&::before': {
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              width: '100%',
              height: '100%',
              opacity: 0,
              content: '""',
            },

            [`> ${componentCls}`]: {
              borderRadius: borderRadiusLG,

              ...genMenuItemStyle(token),
              ...genSubMenuArrowStyle(token),

              [`${componentCls}-item, ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
                borderRadius: subMenuItemBorderRadius,
              },

              [`${componentCls}-submenu-title::after`]: {
                transition: `transform ${motionDurationSlow} ${motionEaseInOut}`,
              },
            },
          },

          [`
          &-placement-leftTop,
          &-placement-bottomRight,
          `]: {
            transformOrigin: '100% 0',
          },

          [`
          &-placement-leftBottom,
          &-placement-topRight,
          `]: {
            transformOrigin: '100% 100%',
          },

          [`
          &-placement-rightBottom,
          &-placement-topLeft,
          `]: {
            transformOrigin: '0 100%',
          },

          [`
          &-placement-bottomLeft,
          &-placement-rightTop,
          `]: {
            transformOrigin: '0 0',
          },

          [`
          &-placement-leftTop,
          &-placement-leftBottom
          `]: {
            paddingInlineEnd: token.paddingXS,
          },

          [`
          &-placement-rightTop,
          &-placement-rightBottom
          `]: {
            paddingInlineStart: token.paddingXS,
          },

          [`
          &-placement-topRight,
          &-placement-topLeft
          `]: {
            paddingBottom: token.paddingXS,
          },

          [`
          &-placement-bottomRight,
          &-placement-bottomLeft
          `]: {
            paddingTop: token.paddingXS,
          },
        },

        ...genSubMenuArrowStyle(token),

        [`&-inline-collapsed ${componentCls}-submenu-arrow,
        &-inline ${componentCls}-submenu-arrow`]: {
          // ↓
          '&::before': {
            transform: `rotate(-45deg) translateX(${unit(menuArrowOffset)})`,
          },

          '&::after': {
            transform: `rotate(45deg) translateX(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`,
          },
        },

        [`${componentCls}-submenu-open${componentCls}-submenu-inline > ${componentCls}-submenu-title > ${componentCls}-submenu-arrow`]:
          {
            // ↑
            transform: `translateY(${unit(token.calc(menuArrowSize).mul(0.2).mul(-1).equal())})`,

            '&::after': {
              transform: `rotate(-45deg) translateX(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`,
            },

            '&::before': {
              transform: `rotate(45deg) translateX(${unit(menuArrowOffset)})`,
            },
          },
      },
    },

    // Integration with header element so menu items have the same height
    {
      [`${antCls}-layout-header`]: {
        [componentCls]: {
          lineHeight: 'inherit',
        },
      },
    },
  ];
};

export const prepareComponentToken: GetDefaultToken<'Menu'> = (token) => {
  const {
    colorPrimary,
    colorError,
    colorTextDisabled,
    colorErrorBg,
    colorText,
    colorTextDescription,
    colorBgContainer,
    colorFillAlter,
    colorFillContent,
    lineWidth,
    lineWidthBold,
    controlItemBgActive,
    colorBgTextHover,
    controlHeightLG,
    lineHeight,
    colorBgElevated,
    marginXXS,
    padding,
    fontSize,
    controlHeightSM,
    fontSizeLG,
    colorTextLightSolid,
    colorErrorHover,
  } = token;

  const activeBarWidth = token.activeBarWidth ?? 0;
  const activeBarBorderWidth = token.activeBarBorderWidth ?? lineWidth;
  const itemMarginInline = token.itemMarginInline ?? token.marginXXS;

  const colorTextDark = new FastColor(colorTextLightSolid).setA(0.65).toRgbString();

  return {
    dropdownWidth: 160,
    zIndexPopup: token.zIndexPopupBase + 50,
    radiusItem: token.borderRadiusLG,
    itemBorderRadius: token.borderRadiusLG,
    radiusSubMenuItem: token.borderRadiusSM,
    subMenuItemBorderRadius: token.borderRadiusSM,
    colorItemText: colorText,
    itemColor: colorText,
    colorItemTextHover: colorText,
    itemHoverColor: colorText,
    colorItemTextHoverHorizontal: colorPrimary,
    horizontalItemHoverColor: colorPrimary,
    colorGroupTitle: colorTextDescription,
    groupTitleColor: colorTextDescription,
    colorItemTextSelected: colorPrimary,
    itemSelectedColor: colorPrimary,
    subMenuItemSelectedColor: colorPrimary,
    colorItemTextSelectedHorizontal: colorPrimary,
    horizontalItemSelectedColor: colorPrimary,
    colorItemBg: colorBgContainer,
    itemBg: colorBgContainer,
    colorItemBgHover: colorBgTextHover,
    itemHoverBg: colorBgTextHover,
    colorItemBgActive: colorFillContent,
    itemActiveBg: controlItemBgActive,
    colorSubItemBg: colorFillAlter,
    subMenuItemBg: colorFillAlter,
    colorItemBgSelected: controlItemBgActive,
    itemSelectedBg: controlItemBgActive,
    colorItemBgSelectedHorizontal: 'transparent',
    horizontalItemSelectedBg: 'transparent',
    colorActiveBarWidth: 0,
    activeBarWidth,
    colorActiveBarHeight: lineWidthBold,
    activeBarHeight: lineWidthBold,
    colorActiveBarBorderSize: lineWidth,
    activeBarBorderWidth,

    // Disabled
    colorItemTextDisabled: colorTextDisabled,
    itemDisabledColor: colorTextDisabled,

    // Danger
    colorDangerItemText: colorError,
    dangerItemColor: colorError,
    colorDangerItemTextHover: colorError,
    dangerItemHoverColor: colorError,
    colorDangerItemTextSelected: colorError,
    dangerItemSelectedColor: colorError,
    colorDangerItemBgActive: colorErrorBg,
    dangerItemActiveBg: colorErrorBg,
    colorDangerItemBgSelected: colorErrorBg,
    dangerItemSelectedBg: colorErrorBg,

    itemMarginInline,

    horizontalItemBorderRadius: 0,
    horizontalItemHoverBg: 'transparent',
    itemHeight: controlHeightLG,
    groupTitleLineHeight: lineHeight,
    collapsedWidth: controlHeightLG * 2,
    popupBg: colorBgElevated,
    itemMarginBlock: marginXXS,
    itemPaddingInline: padding,
    horizontalLineHeight: `${controlHeightLG * 1.15}px`,
    iconSize: fontSize,
    iconMarginInlineEnd: controlHeightSM - fontSize,
    collapsedIconSize: fontSizeLG,
    groupTitleFontSize: fontSize,

    // Disabled
    darkItemDisabledColor: new FastColor(colorTextLightSolid).setA(0.25).toRgbString(),

    // Dark
    darkItemColor: colorTextDark,
    darkDangerItemColor: colorError,
    darkItemBg: '#001529',
    darkPopupBg: '#001529',
    darkSubMenuItemBg: '#000c17',
    darkItemSelectedColor: colorTextLightSolid,
    darkItemSelectedBg: colorPrimary,
    darkDangerItemSelectedBg: colorError,
    darkItemHoverBg: 'transparent',
    darkGroupTitleColor: colorTextDark,
    darkItemHoverColor: colorTextLightSolid,
    darkDangerItemHoverColor: colorErrorHover,
    darkDangerItemSelectedColor: colorTextLightSolid,
    darkDangerItemActiveBg: colorError,

    // internal
    itemWidth: activeBarWidth ? `calc(100% + ${activeBarBorderWidth}px)` : `calc(100% - ${itemMarginInline * 2}px)`,
  };
};

// ============================== Export ==============================
export default (prefixCls: Ref<string>, rootCls: Ref<string> = prefixCls, injectStyle = true) => {
  const useStyle = genStyleHooks(
    'Menu',
    (token) => {
      const {
        colorBgElevated,
        controlHeightLG,
        fontSize,
        darkItemColor,
        darkDangerItemColor,
        darkItemBg,
        darkSubMenuItemBg,
        darkItemSelectedColor,
        darkItemSelectedBg,
        darkDangerItemSelectedBg,
        darkItemHoverBg,
        darkGroupTitleColor,
        darkItemHoverColor,
        darkItemDisabledColor,
        darkDangerItemHoverColor,
        darkDangerItemSelectedColor,
        darkDangerItemActiveBg,
        popupBg,
        darkPopupBg,
      } = token;

      const menuArrowSize = token.calc(fontSize).div(7).mul(5).equal();

      // Menu Token
      const menuToken = mergeToken<MenuToken & CSSUtil>(token, {
        menuArrowSize,
        menuHorizontalHeight: token.calc(controlHeightLG).mul(1.15).equal(),
        menuArrowOffset: token.calc(menuArrowSize).mul(0.25).equal(),
        menuSubMenuBg: colorBgElevated,
        calc: token.calc,
        popupBg,
      });

      const menuDarkToken = mergeToken<MenuToken>(menuToken, {
        itemColor: darkItemColor,
        itemHoverColor: darkItemHoverColor,
        groupTitleColor: darkGroupTitleColor,
        itemSelectedColor: darkItemSelectedColor,
        subMenuItemSelectedColor: darkItemSelectedColor,
        itemBg: darkItemBg,
        popupBg: darkPopupBg,
        subMenuItemBg: darkSubMenuItemBg,
        itemActiveBg: 'transparent',
        itemSelectedBg: darkItemSelectedBg,
        activeBarHeight: 0,
        activeBarBorderWidth: 0,
        itemHoverBg: darkItemHoverBg,

        // Disabled
        itemDisabledColor: darkItemDisabledColor,

        // Danger
        dangerItemColor: darkDangerItemColor,
        dangerItemHoverColor: darkDangerItemHoverColor,
        dangerItemSelectedColor: darkDangerItemSelectedColor,
        dangerItemActiveBg: darkDangerItemActiveBg,
        dangerItemSelectedBg: darkDangerItemSelectedBg,

        menuSubMenuBg: darkSubMenuItemBg,

        // Horizontal
        horizontalItemSelectedColor: darkItemSelectedColor,
        horizontalItemSelectedBg: darkItemSelectedBg,
      });

      return [
        // Basic
        getBaseStyle(menuToken),

        // Horizontal
        getHorizontalStyle(menuToken), // Hard code for some light style

        // Vertical
        getVerticalStyle(menuToken), // Hard code for some light style

        // Theme
        getThemeStyle(menuToken, 'light'),
        getThemeStyle(menuDarkToken, 'dark'),

        // RTL
        getRTLStyle(menuToken),

        // Motion
        genCollapseMotion(menuToken),

        initSlideMotion(menuToken, 'slide-up'),
        initSlideMotion(menuToken, 'slide-down'),
        initZoomMotion(menuToken, 'zoom-big'),
      ];
    },
    prepareComponentToken,
    {
      deprecatedTokens: [],
      // Dropdown will handle menu style self. We do not need to handle this.
      injectStyle,
      unitless: {
        groupTitleLineHeight: true,
      },
    },
  );

  return useStyle(prefixCls, rootCls);
};
