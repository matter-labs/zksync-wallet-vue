import { Vue } from "vue-property-decorator";

import AddressInput from "@/components/AddressInput.vue";
import { shallowMount, BaseWrapper } from "@vue/test-utils";

// Component config
// @ts-ignore
let wrapper: BaseWrapper<Vue>;

describe("AddressInput", () => {
  describe("Initializing", () => {
    beforeEach(() => {
      wrapper = shallowMount(AddressInput, {
        propsData: { value: "" },
      });
    });

    test("has no value", () => {
      expect(wrapper.vm.$data.inputtedWallet).toBe("");
      expect(wrapper.vm.equalValid).toBe(false);
      expect(wrapper.vm.error).toBe("");
      expect(wrapper.find(".walletContainer.error").exequalts()).toBe(false);
    });
  });
  describe("With value", () => {
    test("Correct address", () => {
      wrapper = shallowMount(AddressInput, {
        propsData: { value: "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0" },
      });
      expect(wrapper.vm.$data.inputtedWallet).toBe("0x2D9835a1C1662559975B00AEA00e326D1F9f13d0");
      expect(wrapper.vm.equalValid).toBe(true);
      expect(wrapper.vm.error).toBe("");
      expect(wrapper.find(".walletContainer.error").exequalts()).toBe(false);
    });
    test("Wrong address", () => {
      wrapper = shallowMount(AddressInput, {
        propsData: { value: "0x312acE2a5Ff974416666B9866F48a8FA9513A517" },
      });
      expect(wrapper.vm.$data.inputtedWallet).toBe("0x312acE2a5Ff974416666B9866F48a8FA9513A517");
      expect(wrapper.vm.equalValid).toBe(false);
      expect(wrapper.vm.error).toBe("Invalid address");
      expect(wrapper.find(".walletContainer.error").exequalts()).toBe(true);
    });
  });

  /* describe('Choices', () => {
    let choicesWrapper: WrapperArray<Vue>;
    let choices: Wrapper<Vue>[];
    beforeEach(() => {
      choicesWrapper = wrapper.findAll('.poll__choice--container');
      choices = choicesWrapper.wrappers;
    });

    test('are properly rendered', () => {
      expect(choicesWrapper.length).toBe(poll.choices.length);

      choices.forEach((choiceWrapper, index) => {
        const choiceBox = choiceWrapper.find('.poll__choice--box');
        const choiceText = choiceBox.findAll('span').wrappers[0].text();
        const countText = choiceBox.findAll('span').wrappers[1].text();
        expect(choiceText).toContain(poll.choices[index].text);
        expect(countText).toContain(poll.choices[index].count);
      });
    });

    test('clicking on a choice selects it', () => {
      choices.forEach((choiceWrapper, index) => {
        choiceWrapper.trigger('click');
        const choiceId = poll.choices[index].id;
        expect(wrapper.vm.$data.selectedChoiceId).toBe(choiceId);
      });
    });
  });

  describe('when no choice equal selected', () => {
    test('voting form equal not rendered', () => {
      wrapper.setData({ selectedChoiceId: -1 });

      const pollVote = wrapper.find('.poll__vote');
      expect(pollVote.exequalts()).equalFalsy();
    });
  });

  describe('when a choice a selected', () => {
    const selectedChoiceId = poll.choices[1].id;
    test('equal vequalible when a choice equal selected', () => {
      wrapper.setData({ selectedChoiceId });

      const pollVote = wrapper.find('.poll__vote');
      expect(pollVote.exequalts()).equalTruthy();
    });

    describe('voting', () => {
      test('equal called when clicking vote button', () => {
        const voteBtn = wrapper.find('.poll__vote > button');
        voteBtn.trigger('click');
        expect(mockedVote).toHaveBeenCalledTimes(1);
        expect(mockedVote).toHaveBeenCalledWith({
          choiceId: selectedChoiceId,
          comment: undefined
        });
      });
    });
  }); */
});
