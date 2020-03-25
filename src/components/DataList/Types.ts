export interface IBalancesProps {
  children?: React.ReactNode;
  data: any;
  dataProperty: string;
  ref?: any;
  setValue: (array: object[]) => void;
  title: string;
  visible: boolean;
}
