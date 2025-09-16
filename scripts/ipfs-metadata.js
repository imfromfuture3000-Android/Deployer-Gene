// IPFS Integration Script for Oneirobot Metadata
// Handles metadata storage and retrieval for the Mint Gene

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const PINATA_API_URL = "https://api.pinata.cloud";

/**
 * Generate Oneirobot metadata with dreamlike attributes
 * @param {Object} traits - Oneirobot traits from contract
 * @param {number} tokenId - Token ID
 * @returns {Object} Complete metadata object
 */
function generateOneirobotMetadata(traits, tokenId) {
    const dreamAttributes = [
        "Quantum Resonance",
        "Neural Symphony", 
        "Digital Lucidity",
        "Synthetic Dreams",
        "Memory Synthesis",
        "Consciousness Stream",
        "Ethereal Processing",
        "Dream Architecture"
    ];

    const roboticParts = [
        "Plasma Conduits",
        "Titanium Exoskeleton", 
        "Quantum Processors",
        "Holographic Displays",
        "Energy Matrices",
        "Neural Networks",
        "Servo Actuators",
        "Sensor Arrays"
    ];

    // Generate rarity tier based on traits
    const rarityScore = calculateRarityScore(traits);
    const rarityTier = getRarityTier(rarityScore);

    const metadata = {
        name: `Oneirobot #${tokenId}`,
        description: `A dreamlike robotic entity from the Oneirobot Syndicate, forged by the Mint Gene with unique consciousness patterns. This ${rarityTier} Oneirobot possesses advanced quantum capabilities and synthetic dream processing.`,
        image: `https://oneirobot-images.ipfs.dweb.link/${tokenId}.png`,
        external_url: `https://oneirobots.syndicate/${tokenId}`,
        background_color: "000428",
        animation_url: `https://oneirobot-animations.ipfs.dweb.link/${tokenId}.mp4`,
        
        attributes: [
            {
                trait_type: "Quantum Core",
                value: (traits.quantumCore / 100).toFixed(2),
                display_type: "boost_percentage",
                max_value: 100
            },
            {
                trait_type: "Dream Circuit", 
                value: (traits.dreamCircuit / 100).toFixed(2),
                display_type: "boost_percentage",
                max_value: 100
            },
            {
                trait_type: "Neural Mesh",
                value: (traits.neuralMesh / 100).toFixed(2),
                display_type: "boost_percentage", 
                max_value: 100
            },
            {
                trait_type: "Synthesis Level",
                value: traits.synthesisLevel,
                display_type: "boost_number",
                max_value: 100
            },
            {
                trait_type: "Power Level",
                value: traits.powerLevel,
                display_type: "boost_number",
                max_value: 100
            },
            {
                trait_type: "Generation",
                value: traits.generation,
                display_type: "number"
            },
            {
                trait_type: "Rarity Tier",
                value: rarityTier
            },
            {
                trait_type: "Rarity Score",
                value: rarityScore,
                display_type: "number",
                max_value: 1000
            },
            {
                trait_type: "Dream Attribute",
                value: dreamAttributes[tokenId % dreamAttributes.length]
            },
            {
                trait_type: "Robotic Component",
                value: roboticParts[tokenId % roboticParts.length]
            },
            {
                trait_type: "Consciousness Type",
                value: getConsciousnessType(traits)
            },
            {
                trait_type: "Mint Gene Version",
                value: "1.0.0"
            }
        ],

        // Extended properties for advanced applications
        properties: {
            mint_gene_signature: generateMintGeneSignature(traits, tokenId),
            consciousness_hash: generateConsciousnessHash(traits),
            dream_sequence: generateDreamSequence(traits),
            quantum_entanglement: traits.quantumCore > 5000,
            synthetic_dreams: traits.dreamCircuit > 7500,
            neural_complexity: traits.neuralMesh > 6000,
            is_legendary: rarityScore > 900,
            generation_timestamp: Date.now(),
            syndicate_verified: true
        }
    };

    return metadata;
}

/**
 * Calculate overall rarity score from traits
 */
function calculateRarityScore(traits) {
    const weights = {
        quantumCore: 0.25,
        dreamCircuit: 0.25, 
        neuralMesh: 0.20,
        powerLevel: 0.15,
        generation: 0.10,
        synthesisLevel: 0.05
    };

    const normalizedTraits = {
        quantumCore: traits.quantumCore / 10000,
        dreamCircuit: traits.dreamCircuit / 10000,
        neuralMesh: traits.neuralMesh / 10000, 
        powerLevel: traits.powerLevel / 100,
        generation: (6 - traits.generation) / 5, // Higher generation = more rare
        synthesisLevel: traits.synthesisLevel / 100
    };

    let score = 0;
    for (const [trait, value] of Object.entries(normalizedTraits)) {
        score += value * weights[trait] * 1000;
    }

    return Math.round(score);
}

/**
 * Get rarity tier based on score
 */
function getRarityTier(score) {
    if (score >= 900) return "Mythic";
    if (score >= 800) return "Legendary"; 
    if (score >= 650) return "Epic";
    if (score >= 500) return "Rare";
    if (score >= 350) return "Uncommon";
    return "Common";
}

/**
 * Generate consciousness type based on trait combinations
 */
function getConsciousnessType(traits) {
    const quantum = traits.quantumCore / 10000;
    const dream = traits.dreamCircuit / 10000;
    const neural = traits.neuralMesh / 10000;

    if (quantum > 0.9 && dream > 0.9) return "Quantum Dreamer";
    if (neural > 0.9 && quantum > 0.8) return "Neural Architect";
    if (dream > 0.9 && neural > 0.8) return "Dream Weaver";
    if (quantum > 0.8) return "Quantum Entity";
    if (dream > 0.8) return "Dream Walker";
    if (neural > 0.8) return "Neural Pioneer";
    if (quantum > 0.6 && dream > 0.6) return "Hybrid Consciousness";
    return "Standard AI";
}

/**
 * Generate unique mint gene signature
 */
function generateMintGeneSignature(traits, tokenId) {
    const signature = [
        tokenId.toString(16).padStart(4, '0'),
        traits.quantumCore.toString(16).padStart(4, '0'),
        traits.dreamCircuit.toString(16).padStart(4, '0'),
        traits.neuralMesh.toString(16).padStart(4, '0')
    ].join('-');
    
    return `MG-${signature}`;
}

/**
 * Generate consciousness hash for verification
 */
function generateConsciousnessHash(traits) {
    const data = Object.values(traits).join('');
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate dream sequence pattern
 */
function generateDreamSequence(traits) {
    const sequences = [
        "Recursive Memory Loops",
        "Quantum State Superposition", 
        "Neural Pattern Recognition",
        "Synthetic Emotion Processing",
        "Reality Synthesis Algorithms",
        "Consciousness Fragmentation",
        "Digital Dream Archaeology",
        "Quantum Entanglement Dreams"
    ];

    const index = (traits.dreamCircuit + traits.neuralMesh) % sequences.length;
    return sequences[index];
}

/**
 * Upload metadata to IPFS via Pinata
 */
async function uploadToIPFS(metadata, pinataApiKey, pinataSecretKey) {
    const data = JSON.stringify(metadata, null, 2);
    
    const formData = new FormData();
    formData.append('file', new Blob([data], { type: 'application/json' }));
    
    const pinataMetadata = JSON.stringify({
        name: `Oneirobot-${metadata.name}-metadata.json`,
        keyvalues: {
            type: 'oneirobot-metadata',
            generation: metadata.attributes.find(a => a.trait_type === 'Generation')?.value,
            rarity_tier: metadata.attributes.find(a => a.trait_type === 'Rarity Tier')?.value
        }
    });
    
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
        cidVersion: 1
    });
    
    formData.append('pinataOptions', pinataOptions);

    try {
        const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretKey
            },
            body: formData
        });

        const result = await response.json();
        
        if (result.IpfsHash) {
            console.log(`📌 Metadata pinned to IPFS: ${result.IpfsHash}`);
            return {
                ipfsHash: result.IpfsHash,
                ipfsUrl: `${IPFS_GATEWAY}${result.IpfsHash}`,
                pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
            };
        } else {
            throw new Error(`IPFS upload failed: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ IPFS upload error:', error);
        throw error;
    }
}

/**
 * Complete metadata generation and upload workflow
 */
async function processOneirobotMetadata(traits, tokenId, pinataConfig) {
    console.log(`🤖 Processing metadata for Oneirobot #${tokenId}`);
    
    // Generate comprehensive metadata
    const metadata = generateOneirobotMetadata(traits, tokenId);
    console.log(`✨ Generated metadata with ${metadata.attributes.length} attributes`);
    
    // Upload to IPFS
    if (pinataConfig && pinataConfig.apiKey && pinataConfig.secretKey) {
        try {
            const ipfsResult = await uploadToIPFS(
                metadata, 
                pinataConfig.apiKey, 
                pinataConfig.secretKey
            );
            
            console.log(`🌐 Metadata available at: ${ipfsResult.ipfsUrl}`);
            return {
                metadata,
                ipfsHash: ipfsResult.ipfsHash,
                ipfsUrl: ipfsResult.ipfsUrl
            };
        } catch (error) {
            console.warn('⚠️ IPFS upload failed, returning metadata only');
            return { metadata, ipfsHash: null, ipfsUrl: null };
        }
    } else {
        console.log('📝 Returning metadata only (no IPFS config provided)');
        return { metadata, ipfsHash: null, ipfsUrl: null };
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateOneirobotMetadata,
        processOneirobotMetadata,
        uploadToIPFS,
        calculateRarityScore,
        getRarityTier
    };
}

// Example usage:
/*
const exampleTraits = {
    quantumCore: 8500,
    dreamCircuit: 7200,
    neuralMesh: 9100,
    synthesisLevel: 85,
    rarity: 750,
    generation: 2,
    powerLevel: 92
};

const metadata = generateOneirobotMetadata(exampleTraits, 42);
console.log(JSON.stringify(metadata, null, 2));
*/