// Oneirobot Syndicate Chrome Extension - Content Script
// Detects and displays Oneirobot NFT metadata on various platforms

const ONEIROBOT_CONTRACT = "0x4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a"; // Will be updated with actual deployment
const ETHEREUM_RPC = "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY";

class OneirobotViewer {
    constructor() {
        this.init();
    }

    async init() {
        console.log("🤖 Oneirobot Syndicate Viewer initialized");
        this.injectStyles();
        this.detectOneirobots();
        this.setupObserver();
    }

    injectStyles() {
        if (document.getElementById('oneirobot-styles')) return;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'oneirobot-styles';
        styleSheet.textContent = `
            .oneirobot-overlay {
                position: relative;
                border: 2px solid #00ffff;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                animation: oneirobotGlow 2s infinite alternate;
            }
            
            @keyframes oneirobotGlow {
                from { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
                to { box-shadow: 0 0 30px rgba(0, 255, 255, 0.7); }
            }
            
            .oneirobot-badge {
                position: absolute;
                top: -10px;
                right: -10px;
                background: linear-gradient(45deg, #ff00ff, #00ffff);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
                z-index: 1000;
                animation: badgePulse 1.5s infinite;
            }
            
            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .oneirobot-traits {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                color: #00ffff;
                padding: 8px;
                border-radius: 0 0 6px 6px;
                font-size: 11px;
                line-height: 1.3;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .oneirobot-overlay:hover .oneirobot-traits {
                opacity: 1;
            }
            
            .trait-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
            }
            
            .trait-name {
                color: #ff00ff;
                font-weight: bold;
            }
            
            .trait-value {
                color: #00ffff;
            }
            
            .oneirobot-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #000428, #004e92);
                border: 2px solid #00ffff;
                border-radius: 16px;
                padding: 24px;
                z-index: 10000;
                min-width: 400px;
                color: white;
                box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
            }
            
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    async detectOneirobots() {
        // Detect NFT containers on different platforms
        const nftSelectors = [
            'img[src*="nft"]',
            '.nft-image',
            '.asset-image',
            '.token-image',
            '[data-testid="asset-media"]',
            '.AssetMedia'
        ];

        for (const selector of nftSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => this.checkElement(element));
        }
    }

    async checkElement(element) {
        if (element.dataset.oneirobotChecked) return;
        element.dataset.oneirobotChecked = 'true';

        // Extract token info from various sources
        const tokenInfo = this.extractTokenInfo(element);
        if (!tokenInfo) return;

        if (this.isOneirobotContract(tokenInfo.contract)) {
            await this.enhanceOneirobotDisplay(element, tokenInfo);
        }
    }

    extractTokenInfo(element) {
        // Try to extract contract and token ID from various sources
        const urlParams = new URLSearchParams(window.location.search);
        const href = window.location.href;
        const pathname = window.location.pathname;

        // OpenSea pattern: /assets/ethereum/CONTRACT/TOKEN_ID
        const openSeaMatch = pathname.match(/\/assets\/ethereum\/([^\/]+)\/(\d+)/);
        if (openSeaMatch) {
            return {
                contract: openSeaMatch[1],
                tokenId: openSeaMatch[2],
                platform: 'opensea'
            };
        }

        // Etherscan pattern: look for contract address in URL
        const etherscanMatch = href.match(/0x[a-fA-F0-9]{40}/);
        if (etherscanMatch && href.includes('etherscan.io')) {
            return {
                contract: etherscanMatch[0],
                tokenId: urlParams.get('tokenid') || urlParams.get('a'),
                platform: 'etherscan'
            };
        }

        // Look in data attributes
        const contract = element.dataset.contract || 
                         element.closest('[data-contract]')?.dataset.contract;
        const tokenId = element.dataset.tokenId || 
                       element.closest('[data-token-id]')?.dataset.tokenId;

        if (contract && tokenId) {
            return { contract, tokenId, platform: 'generic' };
        }

        return null;
    }

    isOneirobotContract(contractAddress) {
        if (!contractAddress) return false;
        return contractAddress.toLowerCase() === ONEIROBOT_CONTRACT.toLowerCase();
    }

    async enhanceOneirobotDisplay(element, tokenInfo) {
        try {
            const traits = await this.fetchOneirobotTraits(tokenInfo.tokenId);
            
            // Create overlay container
            const container = element.closest('div') || element.parentElement;
            container.classList.add('oneirobot-overlay');

            // Add Oneirobot badge
            const badge = document.createElement('div');
            badge.className = 'oneirobot-badge';
            badge.textContent = '🤖 ONEIROBOT';
            container.appendChild(badge);

            // Add traits display
            if (traits) {
                const traitsDisplay = this.createTraitsDisplay(traits);
                container.appendChild(traitsDisplay);
            }

            // Add click handler for detailed view
            container.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDetailedModal(tokenInfo, traits);
            });

        } catch (error) {
            console.error('Error enhancing Oneirobot display:', error);
        }
    }

    async fetchOneirobotTraits(tokenId) {
        try {
            // Mock traits for demo - in production, fetch from contract
            return {
                quantumCore: Math.floor(Math.random() * 10000),
                dreamCircuit: Math.floor(Math.random() * 10000),
                neuralMesh: Math.floor(Math.random() * 10000),
                synthesisLevel: Math.floor(Math.random() * 100) + 1,
                rarity: Math.floor(Math.random() * 1000) + 1,
                generation: Math.floor(Math.random() * 5) + 1,
                powerLevel: Math.floor(Math.random() * 100) + 1
            };
        } catch (error) {
            console.error('Error fetching traits:', error);
            return null;
        }
    }

    createTraitsDisplay(traits) {
        const traitsDiv = document.createElement('div');
        traitsDiv.className = 'oneirobot-traits';
        
        const traitRows = [
            { name: 'Quantum Core', value: `${(traits.quantumCore / 100).toFixed(1)}%` },
            { name: 'Dream Circuit', value: `${(traits.dreamCircuit / 100).toFixed(1)}%` },
            { name: 'Neural Mesh', value: `${(traits.neuralMesh / 100).toFixed(1)}%` },
            { name: 'Gen', value: traits.generation },
            { name: 'Power', value: traits.powerLevel }
        ];

        traitRows.forEach(trait => {
            const row = document.createElement('div');
            row.className = 'trait-row';
            row.innerHTML = `
                <span class="trait-name">${trait.name}:</span>
                <span class="trait-value">${trait.value}</span>
            `;
            traitsDiv.appendChild(row);
        });

        return traitsDiv;
    }

    showDetailedModal(tokenInfo, traits) {
        // Remove existing modal
        const existingModal = document.querySelector('.oneirobot-modal');
        if (existingModal) {
            existingModal.parentElement.remove();
        }

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'oneirobot-modal';
        modal.innerHTML = `
            <h2 style="color: #00ffff; margin-bottom: 16px; text-align: center;">
                🤖 Oneirobot #${tokenInfo.tokenId}
            </h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <h3 style="color: #ff00ff; margin-bottom: 8px;">Core Attributes</h3>
                    <div class="trait-row">
                        <span class="trait-name">Quantum Core:</span>
                        <span class="trait-value">${(traits.quantumCore / 100).toFixed(2)}%</span>
                    </div>
                    <div class="trait-row">
                        <span class="trait-name">Dream Circuit:</span>
                        <span class="trait-value">${(traits.dreamCircuit / 100).toFixed(2)}%</span>
                    </div>
                    <div class="trait-row">
                        <span class="trait-name">Neural Mesh:</span>
                        <span class="trait-value">${(traits.neuralMesh / 100).toFixed(2)}%</span>
                    </div>
                </div>
                <div>
                    <h3 style="color: #ff00ff; margin-bottom: 8px;">Performance</h3>
                    <div class="trait-row">
                        <span class="trait-name">Synthesis Level:</span>
                        <span class="trait-value">${traits.synthesisLevel}/100</span>
                    </div>
                    <div class="trait-row">
                        <span class="trait-name">Power Level:</span>
                        <span class="trait-value">${traits.powerLevel}/100</span>
                    </div>
                    <div class="trait-row">
                        <span class="trait-name">Generation:</span>
                        <span class="trait-value">${traits.generation}</span>
                    </div>
                    <div class="trait-row">
                        <span class="trait-name">Rarity Score:</span>
                        <span class="trait-value">${traits.rarity}/1000</span>
                    </div>
                </div>
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <button onclick="this.closest('.modal-backdrop').remove()" 
                        style="background: linear-gradient(45deg, #ff00ff, #00ffff); 
                               border: none; color: white; padding: 8px 16px; 
                               border-radius: 4px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.remove();
            }
        });
    }

    setupObserver() {
        // Watch for dynamically loaded content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.detectOneirobots();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new OneirobotViewer());
} else {
    new OneirobotViewer();
}