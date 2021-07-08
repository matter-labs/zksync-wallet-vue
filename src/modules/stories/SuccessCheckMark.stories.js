/* eslint-disable quotes */
export default {
  title: "Success Check Mark",
  argTypes: {
    big: {
      control: "boolean",
      defaultValue: false,
      description: `Size of the check mark`,
    },
  },
};

export const SuccessCheckMark = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<zk-success-check-mark v-bind="$props" />`,
});
