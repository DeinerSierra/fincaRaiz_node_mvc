import multer from "multer";
import path from "path";


// Configuración de Multer para guardar las imágenes en el directorio 'public/uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage });
export default upload;