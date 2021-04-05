import { ContactsModuleState, state } from "@/store/contacts";

let contactsState: ContactsModuleState;

describe("Contacts state", () => {
  beforeEach(() => {
    contactsState = state();
  });
});
