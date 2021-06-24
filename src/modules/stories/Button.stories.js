/* eslint-disable quotes */
export default {
  title: "Button",
  argTypes: {
    big: {
      control: "boolean",
      defaultValue: false,
      description: "Size of the button",
    },
    outline: {
      control: "boolean",
      defaultValue: false,
      description: `Button outline style`,
    },
    square: {
      control: "boolean",
      defaultValue: false,
      description: `Useful when using icon as "default" slot content`,
    },
    loader: {
      control: "boolean",
      defaultValue: false,
      description: `Adds a loader after "default" slot`,
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: `Disable the button`,
    },
    text: {
      control: "text",
      defaultValue: "Default Button",
      description: `HTML for the "default" slot`,
    },
  },
};

export const Button = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<zk-button v-bind="$props">{{$props.text}}</zk-button>`,
});
