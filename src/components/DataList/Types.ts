export interface IBalancesProps {
  children?: React.ReactNode;
  data: any;
  dataProperty: string;
  setValue: (array: object[]) => void;
  title: string;
  visible: boolean;
}
