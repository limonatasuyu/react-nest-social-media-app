export interface UploadPostDTO {
  text: string;
  userId: string;
  files?: Express.Multer.File[];
  locations?: [number, number][];
}
