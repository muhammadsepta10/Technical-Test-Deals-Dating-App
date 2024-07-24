export interface NewsVerificationDocumentDTO {
  id: string;
  description: string;
  url: string;
}

export interface NewsVerificationDTO {
  id: string;
  title: string;
  desc: string;
  status: number;
  statusText: string;
  createdAt: string;
  approvedAt: string;
  verifiedAt: string;
  verifiedBy: string;
  approvedBy: string;
  documents: NewsVerificationDocumentDTO[];
}
