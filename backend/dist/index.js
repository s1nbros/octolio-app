"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv4first');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./db");
const auth_1 = require("./routes/auth");
const modules_1 = require("./routes/modules");
const progress_1 = require("./routes/progress");
const stripe_1 = require("./routes/stripe");
const generate_1 = require("./routes/generate");
const ai_1 = require("./routes/ai");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:4173', 'https://app.octolio.me'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }), stripe_1.stripeWebhookHandler);
app.use(express_1.default.json());
app.use('/api/auth', auth_1.authRouter);
app.use('/api/modules', modules_1.modulesRouter);
app.use('/api/progress', progress_1.progressRouter);
app.use('/api/stripe', stripe_1.stripeRouter);
app.use('/api/generate', generate_1.generateRouter);
app.use('/api/ai', ai_1.aiRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve frontend static build if it exists (local dev)
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDist)) {
    app.use(express_1.default.static(frontendDist));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
(0, db_1.initDb)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Octolio backend running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
