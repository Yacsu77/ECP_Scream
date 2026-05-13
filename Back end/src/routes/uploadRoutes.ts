import { Router } from 'express'
import { upload } from '../config/multerConfig'
import { uploadModel, deleteModel } from '../controllers/uploadController'

const router = Router()

router.post('/model', upload.single('model'), uploadModel)
router.delete('/model/:filename', deleteModel)

export default router
