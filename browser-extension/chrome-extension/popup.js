// Oneirobot Syndicate Extension - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scan-button');
    const refreshButton = document.getElementById('refresh-button');
    const settingsButton = document.getElementById('settings-button');
    const currentSiteElement = document.getElementById('current-site');
    const detectedCountElement = document.getElementById('detected-count');
    const contractAddressElement = document.getElementById('contract-address');
    const totalSupplyElement = document.getElementById('total-supply');

    // Initialize popup
    init();

    async function init() {
        // Get current tab info
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = new URL(tab.url);
        currentSiteElement.textContent = url.hostname;

        // Load stored data
        loadStoredData();

        // Check if current site is supported
        checkSiteCompatibility(url.hostname);
    }

    function loadStoredData() {
        chrome.storage.local.get(['oneirobotCount', 'contractAddress', 'totalSupply'], (result) => {
            detectedCountElement.textContent = result.oneirobotCount || '0';
            contractAddressElement.textContent = result.contractAddress ? 
                `${result.contractAddress.slice(0, 6)}...${result.contractAddress.slice(-4)}` : 
                'Not deployed';
            totalSupplyElement.textContent = result.totalSupply || '-';
        });
    }

    function checkSiteCompatibility(hostname) {
        const supportedSites = [
            'etherscan.io',
            'opensea.io', 
            'rarible.com',
            'foundation.app',
            'superrare.com',
            'niftygateway.com'
        ];

        const isSupported = supportedSites.some(site => hostname.includes(site));
        const scannerStatus = document.getElementById('scanner-status');
        
        if (isSupported) {
            scannerStatus.textContent = 'Active';
            scannerStatus.className = 'value active';
        } else {
            scannerStatus.textContent = 'Unsupported Site';
            scannerStatus.className = 'value inactive';
        }
    }

    // Event listeners
    scanButton.addEventListener('click', async () => {
        scanButton.textContent = '🔍 Scanning...';
        scanButton.disabled = true;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send message to content script to scan for Oneirobots
            chrome.tabs.sendMessage(tab.id, { action: 'scanPage' }, (response) => {
                if (response && response.count !== undefined) {
                    detectedCountElement.textContent = response.count;
                    chrome.storage.local.set({ oneirobotCount: response.count });
                    
                    if (response.count > 0) {
                        showNotification(`Found ${response.count} Oneirobot(s)!`);
                    } else {
                        showNotification('No Oneirobots detected on this page');
                    }
                } else {
                    showNotification('Failed to scan page - content script not loaded');
                }
            });
        } catch (error) {
            console.error('Scan error:', error);
            showNotification('Scan failed - please refresh the page');
        } finally {
            setTimeout(() => {
                scanButton.textContent = '🔍 Scan Page';
                scanButton.disabled = false;
            }, 2000);
        }
    });

    refreshButton.addEventListener('click', async () => {
        refreshButton.textContent = '🔄 Refreshing...';
        refreshButton.disabled = true;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Reload content script
            chrome.tabs.sendMessage(tab.id, { action: 'refresh' }, () => {
                loadStoredData();
                showNotification('Detection refreshed');
            });
        } catch (error) {
            console.error('Refresh error:', error);
            showNotification('Refresh failed');
        } finally {
            setTimeout(() => {
                refreshButton.textContent = '🔄 Refresh Detection';
                refreshButton.disabled = false;
            }, 1500);
        }
    });

    settingsButton.addEventListener('click', () => {
        // Open options page
        chrome.runtime.openOptionsPage();
    });

    function showNotification(message) {
        const statusText = document.getElementById('status-text');
        const originalText = statusText.textContent;
        
        statusText.textContent = message;
        statusText.className = 'active';
        
        setTimeout(() => {
            statusText.textContent = originalText;
        }, 3000);
    }

    // Listen for updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateStats') {
            if (message.contractAddress) {
                contractAddressElement.textContent = 
                    `${message.contractAddress.slice(0, 6)}...${message.contractAddress.slice(-4)}`;
            }
            if (message.totalSupply) {
                totalSupplyElement.textContent = message.totalSupply;
            }
            if (message.oneirobotCount !== undefined) {
                detectedCountElement.textContent = message.oneirobotCount;
            }
        }
    });

    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadStoredData();
    }, 30000);
});