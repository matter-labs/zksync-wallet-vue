/* eslint-disable quotes */
export default {
  title: "Input",
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["sm", "md", "xs"],
      },
      defaultValue: "md",
      description: `Size of the input`,
    },
    type: {
      control: "text",
      defaultValue: "text",
      description: `Input HTML type`,
    },
    placeholder: {
      control: "text",
      defaultValue: "Placeholder",
      description: `Input placeholder`,
    },
    maxlength: {
      control: "number",
      defaultValue: 500,
      description: `Input maxlength`,
    },
    iconSlot: {
      control: "text",
      defaultValue: "",
      description: `HTML for the "icon" slot`,
    },
    error: {
      control: "boolean",
      defaultValue: false,
      description: `Error state`,
    },
    autoWidth: {
      control: "boolean",
      defaultValue: false,
      description: `Disable the input`,
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: `Disable the input`,
    },
  },
};

export const Input = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
    <zk-input v-bind="$props">
      <template slot="icon">
        <div v-html="$props.iconSlot"></div>
      </template>
    </zk-input>
  `,
});
