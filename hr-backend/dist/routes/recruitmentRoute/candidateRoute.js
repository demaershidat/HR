"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const candidateController_1 = require("../../controller/recruitmentController/candidateController");
const router = express_1.default.Router();
const uploadPath = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});
const upload = (0, multer_1.default)({ storage });
const multiUpload = upload.fields([
    { name: 'cvFile', maxCount: 1 },
    { name: 'photoFile', maxCount: 1 }
]);
router.get('/all', candidateController_1.getAllCandidates);
router.post('/add', multiUpload, candidateController_1.addCandidate);
router.put('/:id', multiUpload, candidateController_1.updateCandidate);
router.delete('/:id', candidateController_1.deleteCandidate);
router.post('/delete-bulk', candidateController_1.deleteBulkCandidates);
exports.default = router;
