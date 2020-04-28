export interface ISaveContactsProps {
  addressInput: boolean;
  addressValue?: string;
  edit?: boolean;
  oldContact?: { name: string; address: string };
  title: string;
  onSaveContact?: () => void;
}
