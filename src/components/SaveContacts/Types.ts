export interface ISaveContactsProps {
  addressInput: boolean;
  edit?: boolean;
  oldContact?: { name: string; address: string };
  title: string;
  onSaveContact?: () => void;
}
