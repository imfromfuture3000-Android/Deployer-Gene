"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendDeploymentEvent = appendDeploymentEvent;
exports.readDeploymentLog = readDeploymentLog;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cacheDir = path.join(process.cwd(), '.cache');
const logPath = path.join(cacheDir, 'deployment-log.json');
function ensure() { if (!fs.existsSync(cacheDir))
    fs.mkdirSync(cacheDir, { recursive: true }); }
function appendDeploymentEvent(event) {
    ensure();
    let existing = [];
    if (fs.existsSync(logPath)) {
        try {
            existing = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        }
        catch { }
    }
    existing.push(event);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
}
function readDeploymentLog() {
    if (!fs.existsSync(logPath))
        return [];
    try {
        return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    }
    catch {
        return [];
    }
}
