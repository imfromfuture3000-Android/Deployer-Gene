"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDeployerAuth = loadDeployerAuth;
exports.getDeployerPublicKey = getDeployerPublicKey;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = require("fs");
const path_1 = require("path");
let deployerKeypair = null;
function loadDeployerAuth() {
    if (deployerKeypair)
        return deployerKeypair;
    try {
        const keyPath = (0, path_1.join)(process.cwd(), '.deployer.key');
        const privateKeyString = (0, fs_1.readFileSync)(keyPath, 'utf8').trim();
        const privateKeyBytes = Buffer.from(privateKeyString, 'base64');
        deployerKeypair = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
        return deployerKeypair;
    }
    catch (error) {
        throw new Error('Deployer key not found or invalid');
    }
}
function getDeployerPublicKey() {
    return loadDeployerAuth().publicKey.toBase58();
}
