"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./db");
const auth_1 = require("./routes/auth");
const modules_1 = require("./routes/modules");
const progress_1 = require("./routes/progress");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:4173', 'https://octolio-app.vercel.app'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
(0, db_1.initDb)();
app.use('/api/auth', auth_1.authRouter);
app.use('/api/modules', modules_1.modulesRouter);
app.use('/api/progress', progress_1.progressRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve frontend static build if it exists
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDist)) {
    app.use(express_1.default.static(frontendDist));
    // SPA fallback — serve index.html for any non-API route
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`🚀 Octolio backend running on http://localhost:${PORT}`);
});
