/* eslint-disable quotes */
export default {
  title: "Modal",
  argTypes: {
    value: {
      control: "boolean",
      defaultValue: true,
      description: "v-model to display modal",
    },
    block: {
      control: "boolean",
      defaultValue: false,
      description: "Makes modal position static and not fixed.\n\nModal is always visible if set to true.",
    },
    notClosable: {
      control: "boolean",
      defaultValue: false,
      description: "If set to true disables modal closing functionality.\n\nNo closing if block set to true.",
    },
    headerSlot: {
      control: "text",
      defaultValue: "This is a modal header",
      description: `HTML for the "header" slot`,
    },
    defaultSlot: {
      control: "text",
      defaultValue: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Exercitationem a consequuntur temporibus iste sunt doloribus.",
      description: `HTML for the "default" slot`,
    },
    footerSlot: {
      control: "text",
      defaultValue: "This is a modal footer",
      description: `HTML for the "footer" slot`,
    },
  },
};

export const Modal = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
    <zk-modal v-model="$props.value" :block="$props.block" :notClosable="$props.notClosable">
      <template slot="header">{{ $props.headerSlot }}</template>
      <template slot="default">{{ $props.defaultSlot }}</template>
      <template slot="footer">{{ $props.footerSlot }}</template>
    </zk-modal>
  `,
});
