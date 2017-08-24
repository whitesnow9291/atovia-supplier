export interface File {
  _id: string;
  complete: boolean;
  extension: string;
  name: string;
  progress: number;
  size: number;
  store: string;
  token: string;
  type: string;
  uploadedAt: Date;
  uploading: boolean;
  url: string;
  userId?: string;
}
