import { File } from "./ufs-file.model";

export interface Image extends File {
}

export interface Thumb extends Image  {
  originalStore?: string;
  originalId?: string;
}
