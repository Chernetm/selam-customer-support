export interface ReceiptData {
  seqNum: string;
  tin: string;
  invoiceType: string;
  taxPayerName: string;
  region: string;
  cityName: string;
  taxCentreName: string;
  applicationDate: string;
  noOfPad: number;
  palletNumber: string;
  packageShelfNum: string;
  deliveryShelfNum: string;
  summaryStatus: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  amount: number;
  deliveryDate: string;
  printStatus: 'Ready' | 'Processing' | 'Not Started';
}
