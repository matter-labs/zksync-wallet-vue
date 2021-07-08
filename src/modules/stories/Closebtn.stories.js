/* eslint-disable quotes */
export default {
  title: "Close Button",
};

export const CloseButton = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<zk-closebtn />`,
});
