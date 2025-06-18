"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../actions/auth");
const router = express_1.default.Router();
// POST /api/auth/signup
router.post('/signup', auth_1.signup);
// POST /api/auth/login
router.post('/login', auth_1.login);
// POST /api/auth/logout
router.post('/logout', auth_1.logout);
exports.default = router;
//# sourceMappingURL=route.js.map