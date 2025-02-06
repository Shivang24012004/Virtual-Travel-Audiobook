// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import dotenv from "dotenv"

// dotenv.config()
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // export const uploadToCloudinary = async (file) => {
// //   try {
// //     const fName = file.originalname.split('.')[0];
    
// //     // Convert buffer to Base64
// //     const b64 = Buffer.from(file.buffer).toString('base64');
// //     const dataURI = `data:${file.mimetype};base64,${b64}`;
    
// //     const result = await cloudinary.uploader.upload(dataURI, {
// //       resource_type: 'auto',
// //       public_id: `audioTutorial/${fName}`,
// //       folder: 'audio'
// //     });
    
// //     return result;
// //   } catch (error) {
// //     console.error('Cloudinary upload error:', error);
// //     throw error;
// //   }
// // };

// export const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'audio',
//     allowed_formats: ['mp3', 'wav', 'ogg'],
//     resource_type: 'auto'
//   },
// });

// export const uploadToCloudinary = (file) => {
//   return new Promise((resolve, reject) => {
//     const uploadOptions = {
//       resource_type: "auto",
//       folder: "audio",
//       use_filename: true,
//       unique_filename: true
//     };

//     const uploadStream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     uploadStream.end(file.buffer);
//   });
// };

// export const deleteFromCloudinary = async (publicId) => {
//   return cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
// };

import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "audio_files",
    resource_type: "video", // Cloudinary uses 'video' for audio files
    allowed_formats: ["mp3", "wav", "ogg"], // Add or remove formats as needed
  },
})

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video" }, // Specify 'video' for audio files
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )

    uploadStream.end(file.buffer)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
    return result
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error)
    throw error
  }
}

export default storage

