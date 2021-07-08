/* eslint-disable quotes */
export default {
  title: "Loader",
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["xs", "sm", "md", "lg"],
      },
      defaultValue: "md",
      description: `Size of the loader`,
    },
    color: {
      control: {
        type: "select",
        options: ["violet", "gray", "white"],
      },
      defaultValue: "violet",
      description: `Color of the loader`,
    },
  },
};

export const Loader = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<zk-loader v-bind="$props" />`,
});
