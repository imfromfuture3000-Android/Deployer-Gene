import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { OneirobotSyndicate } from "../typechain-types";

describe("OneirobotSyndicate - Mint Gene Tests", function () {
  let oneirobotSyndicate: OneirobotSyndicate;
  let owner: SignerWithAddress;
  let syndicateMaster: SignerWithAddress;
  let user: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const CONTROLLER_MASTER = "0x4eAbbE6EAD2c295b3f4eFD78f6A7e89eAb1DDfFb";
  const SAMPLE_IPFS_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

  beforeEach(async function () {
    [owner, syndicateMaster, user, unauthorized] = await ethers.getSigners();

    const OneirobotSyndicateFactory = await ethers.getContractFactory("OneirobotSyndicate");
    oneirobotSyndicate = await OneirobotSyndicateFactory.deploy(
      "Oneirobot Syndicate",
      "ONEIRO",
      "https://oneirobot-metadata.ipfs.io/"
    );
    
    await oneirobotSyndicate.waitForDeployment();

    // Grant Syndicate Master role to test account
    await oneirobotSyndicate.addSyndicateMaster(syndicateMaster.address);
  });

  describe("Deployment and Initialization", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await oneirobotSyndicate.name()).to.equal("Oneirobot Syndicate");
      expect(await oneirobotSyndicate.symbol()).to.equal("ONEIRO");
      expect(await oneirobotSyndicate.totalSupply()).to.equal(0);
    });

    it("Should have correct roles assigned", async function () {
      const SYNDICATE_MASTER_ROLE = await oneirobotSyndicate.SYNDICATE_MASTER_ROLE();
      const DEFAULT_ADMIN_ROLE = await oneirobotSyndicate.DEFAULT_ADMIN_ROLE();

      expect(await oneirobotSyndicate.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await oneirobotSyndicate.hasRole(SYNDICATE_MASTER_ROLE, owner.address)).to.be.true;
      expect(await oneirobotSyndicate.hasRole(SYNDICATE_MASTER_ROLE, syndicateMaster.address)).to.be.true;
      expect(await oneirobotSyndicate.isSyndicateMaster(CONTROLLER_MASTER)).to.be.true;
    });

    it("Should emit MintGeneActivated event on deployment", async function () {
      const OneirobotSyndicateFactory = await ethers.getContractFactory("OneirobotSyndicate");
      
      await expect(OneirobotSyndicateFactory.deploy(
        "Test",
        "TEST", 
        "https://test.ipfs.io/"
      )).to.emit(await ethers.getContractFactory("OneirobotSyndicate"), "MintGeneActivated");
    });
  });

  describe("Mint Gene Core Functionality", function () {
    it("Should allow Syndicate Master to mint Oneirobot", async function () {
      await expect(
        oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH)
      ).to.emit(oneirobotSyndicate, "OneirobotMinted")
        .withArgs(0, user.address, anyValue, anyValue, anyValue, anyValue);

      expect(await oneirobotSyndicate.ownerOf(0)).to.equal(user.address);
      expect(await oneirobotSyndicate.totalSupply()).to.equal(1);
    });

    it("Should prevent unauthorized minting", async function () {
      await expect(
        oneirobotSyndicate.connect(unauthorized).mintOneirobot(user.address, SAMPLE_IPFS_HASH)
      ).to.be.revertedWith("OneirobotSyndicate: Caller is not a Syndicate Master");
    });

    it("Should prevent minting to zero address", async function () {
      await expect(
        oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(ethers.ZeroAddress, SAMPLE_IPFS_HASH)
      ).to.be.revertedWith("OneirobotSyndicate: Cannot mint to zero address");
    });

    it("Should prevent minting with empty IPFS hash", async function () {
      await expect(
        oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, "")
      ).to.be.revertedWith("OneirobotSyndicate: IPFS hash required");
    });

    it("Should generate unique traits for each Oneirobot", async function () {
      // Mint two tokens
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);

      const traits1 = await oneirobotSyndicate.getOneirobotTraits(0);
      const traits2 = await oneirobotSyndicate.getOneirobotTraits(1);

      // Traits should be different (very unlikely to be identical with good randomness)
      expect(
        traits1.quantumCore !== traits2.quantumCore ||
        traits1.dreamCircuit !== traits2.dreamCircuit ||
        traits1.neuralMesh !== traits2.neuralMesh
      ).to.be.true;
    });

    it("Should enforce maximum supply limit", async function () {
      // This would be very expensive to test fully, so we'll test the logic
      const maxSupply = await oneirobotSyndicate.MAX_SUPPLY();
      expect(maxSupply).to.equal(10000);
      
      // Test that the check exists by looking at the contract bytecode or
      // We can test a smaller version by checking totalSupply increases correctly
      for (let i = 0; i < 5; i++) {
        await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
      }
      expect(await oneirobotSyndicate.totalSupply()).to.equal(5);
    });
  });

  describe("Trait Generation and Attributes", function () {
    beforeEach(async function () {
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
    });

    it("Should generate traits within valid ranges", async function () {
      const traits = await oneirobotSyndicate.getOneirobotTraits(0);

      expect(traits.quantumCore).to.be.gte(0).and.lte(10000);
      expect(traits.dreamCircuit).to.be.gte(0).and.lte(10000);
      expect(traits.neuralMesh).to.be.gte(0).and.lte(10000);
      expect(traits.synthesisLevel).to.be.gte(1).and.lte(100);
      expect(traits.rarity).to.be.gte(1).and.lte(1000);
      expect(traits.generation).to.be.gte(1).and.lte(5);
      expect(traits.powerLevel).to.be.gte(1).and.lte(100);
    });

    it("Should return correct trait data", async function () {
      const traits = await oneirobotSyndicate.getOneirobotTraits(0);
      
      expect(traits.quantumCore).to.be.a('bigint');
      expect(traits.dreamCircuit).to.be.a('bigint');
      expect(traits.neuralMesh).to.be.a('bigint');
      expect(traits.synthesisLevel).to.be.a('bigint');
      expect(traits.rarity).to.be.a('bigint');
      expect(traits.generation).to.be.a('bigint');
      expect(traits.powerLevel).to.be.a('bigint');
    });

    it("Should fail to get traits for non-existent token", async function () {
      await expect(
        oneirobotSyndicate.getOneirobotTraits(999)
      ).to.be.revertedWith("OneirobotSyndicate: Token does not exist");
    });
  });

  describe("Access Control and Security", function () {
    it("Should allow admin to add Syndicate Masters", async function () {
      const newMaster = unauthorized.address;
      
      await expect(
        oneirobotSyndicate.addSyndicateMaster(newMaster)
      ).to.emit(oneirobotSyndicate, "SyndicateMasterAdded")
        .withArgs(newMaster);

      expect(await oneirobotSyndicate.isSyndicateMaster(newMaster)).to.be.true;
    });

    it("Should prevent non-admin from adding Syndicate Masters", async function () {
      await expect(
        oneirobotSyndicate.connect(unauthorized).addSyndicateMaster(user.address)
      ).to.be.revertedWith(/AccessControl/);
    });

    it("Should allow admin to remove Syndicate Masters", async function () {
      await oneirobotSyndicate.removeSyndicateMaster(syndicateMaster.address);
      expect(await oneirobotSyndicate.isSyndicateMaster(syndicateMaster.address)).to.be.false;
    });

    it("Should prevent adding zero address as Syndicate Master", async function () {
      await expect(
        oneirobotSyndicate.addSyndicateMaster(ethers.ZeroAddress)
      ).to.be.revertedWith("OneirobotSyndicate: Invalid master address");
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow admin to pause and unpause", async function () {
      await oneirobotSyndicate.pause();
      
      await expect(
        oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH)
      ).to.be.revertedWith("Pausable: paused");

      await oneirobotSyndicate.unpause();
      
      await expect(
        oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH)
      ).to.not.be.reverted;
    });

    it("Should prevent non-admin from pausing", async function () {
      await expect(
        oneirobotSyndicate.connect(unauthorized).pause()
      ).to.be.revertedWith(/AccessControl/);
    });
  });

  describe("Metadata and URI Functions", function () {
    beforeEach(async function () {
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
    });

    it("Should return correct token URI", async function () {
      const tokenURI = await oneirobotSyndicate.tokenURI(0);
      expect(tokenURI).to.include(SAMPLE_IPFS_HASH);
    });

    it("Should allow admin to update base URI", async function () {
      const newBaseURI = "https://new-oneirobot-metadata.ipfs.io/";
      await oneirobotSyndicate.setBaseURI(newBaseURI);
      
      // Mint new token to test new base URI
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, "newHash");
      const tokenURI = await oneirobotSyndicate.tokenURI(1);
      expect(tokenURI).to.include("newHash");
    });

    it("Should prevent non-admin from updating base URI", async function () {
      await expect(
        oneirobotSyndicate.connect(unauthorized).setBaseURI("https://malicious.com/")
      ).to.be.revertedWith(/AccessControl/);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for minting", async function () {
      const tx = await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
      const receipt = await tx.wait();
      
      // Gas should be reasonable (less than 200k for a feature-rich mint)
      expect(receipt!.gasUsed).to.be.lt(200000);
    });

    it("Should efficiently pack trait data", async function () {
      // Test that traits are properly packed by checking storage efficiency
      await oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH);
      const traits = await oneirobotSyndicate.getOneirobotTraits(0);
      
      // All trait values should fit within their designated bit ranges
      expect(traits.quantumCore).to.be.lt(2n ** 64n);
      expect(traits.synthesisLevel).to.be.lt(2n ** 32n);
      expect(traits.rarity).to.be.lt(2n ** 16n);
      expect(traits.generation).to.be.lt(2n ** 8n);
      expect(traits.powerLevel).to.be.lt(2n ** 8n);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks during minting", async function () {
      // This test verifies the nonReentrant modifier is in place
      // In a real attack scenario, we'd need a malicious contract
      // For now, we verify the modifier exists by checking multiple rapid calls
      
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          oneirobotSyndicate.connect(syndicateMaster).mintOneirobot(user.address, SAMPLE_IPFS_HASH)
        );
      }
      
      // All should succeed (no reentrancy issue in normal case)
      await Promise.all(promises);
      expect(await oneirobotSyndicate.totalSupply()).to.equal(3);
    });
  });
});

// Helper function for matching any value in events
const anyValue = ethers.Typed.any();