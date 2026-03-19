"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jobRoute_1 = __importDefault(require("./routes/jobRoute"));
const candidateRoute_1 = __importDefault(require("./routes/candidateRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const interviewRoutes_1 = __importDefault(require("./routes/interviewRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const uploadsPath = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsPath))
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(uploadsPath));
app.use('/jobs', jobRoute_1.default);
app.use('/candidates', candidateRoute_1.default);
app.use('/login', authRoute_1.default);
app.use('/interviews', interviewRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
