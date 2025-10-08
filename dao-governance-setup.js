#!/usr/bin/env node

const fs = require('fs');
const { PublicKey } = require('@solana/web3.js');

class DAOGovernanceSetup {
  constructor() {
    this.treasuryPubkey = process.env.TREASURY_PUBKEY;
  }

  async setupGovernanceStructure() {
    console.log('🏛️ SETTING UP DAO GOVERNANCE STRUCTURE');
    
    const governanceConfig = {
      name: 'Deployer Gene DAO',
      description: 'Decentralized governance for the Deployer Gene ecosystem',
      votingMechanism: 'token-weighted',
      proposalTypes: [
        'treasury-allocation',
        'parameter-changes',
        'upgrade-proposals',
        'partnership-approvals'
      ],
      votingPeriods: {
        proposal: 3 * 24 * 60 * 60, // 3 days
        voting: 7 * 24 * 60 * 60,   // 7 days
        execution: 2 * 24 * 60 * 60 // 2 days
      },
      quorumRequirements: {
        standard: 0.1,    // 10%
        critical: 0.25,   // 25%
        emergency: 0.5    // 50%
      },
      authorities: {
        treasury: this.treasuryPubkey,
        governance: this.treasuryPubkey,
        emergency: this.treasuryPubkey
      },
      created: new Date().toISOString(),
      status: 'active'
    };

    const votingPowers = {
      tokenHolders: 0.7,    // 70% voting power
      botOperators: 0.2,    // 20% voting power
      coreTeam: 0.1         // 10% voting power
    };

    const proposalTemplates = [
      {
        type: 'treasury-allocation',
        title: 'Treasury Fund Allocation',
        description: 'Proposal to allocate treasury funds for specific purposes',
        requiredQuorum: 0.15,
        votingPeriod: 7 * 24 * 60 * 60
      },
      {
        type: 'parameter-changes',
        title: 'Protocol Parameter Changes',
        description: 'Proposal to modify protocol parameters',
        requiredQuorum: 0.2,
        votingPeriod: 5 * 24 * 60 * 60
      },
      {
        type: 'upgrade-proposals',
        title: 'System Upgrade Proposal',
        description: 'Proposal for system upgrades and improvements',
        requiredQuorum: 0.25,
        votingPeriod: 10 * 24 * 60 * 60
      }
    ];

    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    
    fs.writeFileSync('.cache/dao-governance.json', JSON.stringify(governanceConfig, null, 2));
    fs.writeFileSync('.cache/voting-powers.json', JSON.stringify(votingPowers, null, 2));
    fs.writeFileSync('.cache/proposal-templates.json', JSON.stringify(proposalTemplates, null, 2));

    console.log('✅ DAO governance structure configured');
    console.log('📋 Governance config saved to .cache/dao-governance.json');
    console.log('🗳️ Voting powers saved to .cache/voting-powers.json');
    console.log('📝 Proposal templates saved to .cache/proposal-templates.json');

    return { governanceConfig, votingPowers, proposalTemplates };
  }

  async createInitialProposal() {
    console.log('📝 CREATING INITIAL DAO PROPOSAL');
    
    const initialProposal = {
      id: 'PROP-001',
      title: 'Initialize Deployer Gene DAO',
      description: 'Proposal to officially initialize the Deployer Gene DAO with initial parameters and treasury allocation',
      type: 'initialization',
      proposer: this.treasuryPubkey,
      created: new Date().toISOString(),
      votingStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
      votingEnd: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      status: 'pending',
      votes: {
        for: 0,
        against: 0,
        abstain: 0
      },
      actions: [
        'Set initial governance parameters',
        'Allocate 10% of treasury for development',
        'Establish bot operator rewards program'
      ]
    };

    fs.writeFileSync('.cache/initial-proposal.json', JSON.stringify(initialProposal, null, 2));
    
    console.log('✅ Initial proposal created:', initialProposal.id);
    return initialProposal;
  }
}

const setup = new DAOGovernanceSetup();
setup.setupGovernanceStructure()
  .then(() => setup.createInitialProposal())
  .catch(console.error);