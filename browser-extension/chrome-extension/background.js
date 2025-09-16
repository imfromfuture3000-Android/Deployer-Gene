// Oneirobot Syndicate Extension - Background Service Worker

const ONEIROBOT_CONTRACT = "0x4eJZVbbsiLAG6EkWvgEYEWKEpdhJPFBYMeJ6DBX98w6a";
const ETHEREUM_RPC = "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY";

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('🤖 Oneirobot Syndicate Extension installed');
    
    // Set up initial storage
    chrome.storage.local.set({
        contractAddress: ONEIROBOT_CONTRACT,
        oneirobotCount: 0,
        totalSupply: 0,
        lastUpdate: Date.now()
    });

    // Show welcome notification
    if (details.reason === 'install') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '🤖 Oneirobot Syndicate Active',
            message: 'Mint Gene activated! The extension will now detect Oneirobots across NFT platforms.'
        });
    }
});

// Tab update listener - check for NFT platforms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const supportedSites = [
            'etherscan.io',
            'opensea.io', 
            'rarible.com',
            'foundation.app'
        ];

        if (supportedSites.some(site => url.hostname.includes(site))) {
            // Inject content script if on supported site
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(err => {
                console.log('Script injection failed:', err);
            });
        }
    }
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'oneirobotDetected':
            handleOneirobotDetection(message.data);
            break;
        case 'getContractStats':
            getContractStats().then(sendResponse);
            return true; // Keep channel open for async response
        case 'updateBadge':
            updateBadge(message.count);
            break;
    }
});

// Handle Oneirobot detection
function handleOneirobotDetection(data) {
    // Update storage
    chrome.storage.local.get(['oneirobotCount'], (result) => {
        const newCount = (result.oneirobotCount || 0) + 1;
        chrome.storage.local.set({ 
            oneirobotCount: newCount,
            lastDetection: Date.now()
        });

        // Update badge
        updateBadge(newCount);

        // Show notification for first detection
        if (newCount === 1) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: '🤖 Oneirobot Detected!',
                message: `Found Oneirobot #${data.tokenId} on this page`
            });
        }
    });
}

// Update extension badge
function updateBadge(count) {
    const badgeText = count > 0 ? count.toString() : '';
    const badgeColor = count > 0 ? '#00ffff' : '#666666';
    
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

// Get contract statistics
async function getContractStats() {
    try {
        // This would make actual contract calls in production
        // For now, return mock data
        return {
            contractAddress: ONEIROBOT_CONTRACT,
            totalSupply: Math.floor(Math.random() * 1000),
            maxSupply: 10000,
            lastUpdate: Date.now()
        };
    } catch (error) {
        console.error('Failed to get contract stats:', error);
        return null;
    }
}

// Periodic stats update (every 5 minutes)
setInterval(async () => {
    const stats = await getContractStats();
    if (stats) {
        chrome.storage.local.set({
            totalSupply: stats.totalSupply,
            lastUpdate: stats.lastUpdate
        });

        // Notify popup if open
        chrome.runtime.sendMessage({
            action: 'updateStats',
            ...stats
        }).catch(() => {
            // Popup might not be open, ignore error
        });
    }
}, 5 * 60 * 1000);

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'oneirobotInfo',
        title: '🤖 Check Oneirobot Info',
        contexts: ['image', 'link']
    });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'oneirobotInfo') {
        // Send message to content script to check element
        chrome.tabs.sendMessage(tab.id, {
            action: 'checkElement',
            element: info.srcUrl || info.linkUrl
        });
    }
});

// Alarm for periodic maintenance
chrome.alarms.create('maintenance', { delayInMinutes: 60, periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'maintenance') {
        // Clean up old data, update stats, etc.
        chrome.storage.local.get(null, (data) => {
            console.log('🧠 Maintenance cycle - Current data:', data);
        });
    }
});