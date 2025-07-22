/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss', 'stylelint-config-recess-order'],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json', '**/*.md', '**/iconfont/**', '**/*.less'],
  plugins: ['stylelint-order', '@stylistic/stylelint-plugin', 'stylelint-prettier'],
  overrides: [
    {
      customSyntax: 'postcss-html',
      files: ['*.(html|vue)', '**/*.(html|vue)'],
      rules: {
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global', 'deep'],
          },
        ],
        'selector-pseudo-element-no-unknown': [
          true,
          {
            ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'],
          },
        ],
      },
    },
  ],
  rules: {
    'prettier/prettier': true,
    'no-empty-source': null,
    'no-descending-specificity': null,
    'at-rule-no-unknown': null,
    'at-rule-no-deprecated': null,
    'import-notation': null,
    'custom-property-pattern': null,
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
  },
};
