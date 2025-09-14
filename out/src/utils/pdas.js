"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMetadataPda = findMetadataPda;
exports.findAssociatedTokenAddress = findAssociatedTokenAddress;
const web3_js_1 = require("@solana/web3.js");
function findMetadataPda(mint) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'))[0];
}
function findAssociatedTokenAddress(owner, mint) {
    return web3_js_1.PublicKey.findProgramAddressSync([owner.toBuffer(), new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'))[0];
}
