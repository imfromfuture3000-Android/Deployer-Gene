#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

class SolanaChangelogSearcher {
  constructor() {
    this.githubApi = 'api.github.com';
    this.solanaRepo = 'solana-labs/solana';
  }

  async githubRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.githubApi,
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'Solana-Changelog-Searcher',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async searchChangelogs() {
    console.log('🔍 SEARCHING SOLANA GITHUB FOR CHANGELOG UPDATES');
    console.log('=' .repeat(60));
    
    const results = {
      releases: [],
      changelogFiles: [],
      recentCommits: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Get latest releases
      console.log('\n📋 Fetching latest releases...');
      const releases = await this.githubRequest(`/repos/${this.solanaRepo}/releases?per_page=10`);
      
      if (releases && Array.isArray(releases)) {
        for (const release of releases.slice(0, 5)) {
          results.releases.push({
            name: release.name,
            tag: release.tag_name,
            published: release.published_at,
            body: release.body?.substring(0, 500) + '...',
            url: release.html_url
          });
          
          console.log(`✅ ${release.tag_name}: ${release.name}`);
          console.log(`   📅 ${new Date(release.published_at).toLocaleDateString()}`);
        }
      }

      // Search for changelog files
      console.log('\n📄 Searching for changelog files...');
      const searchResults = await this.githubRequest(`/search/code?q=filename:CHANGELOG+repo:${this.solanaRepo}`);
      
      if (searchResults?.items) {
        for (const item of searchResults.items.slice(0, 5)) {
          results.changelogFiles.push({
            name: item.name,
            path: item.path,
            url: item.html_url,
            repository: item.repository.full_name
          });
          
          console.log(`✅ ${item.name} in ${item.path}`);
        }
      }

      // Get recent commits
      console.log('\n🔄 Fetching recent commits...');
      const commits = await this.githubRequest(`/repos/${this.solanaRepo}/commits?per_page=10`);
      
      if (commits && Array.isArray(commits)) {
        for (const commit of commits.slice(0, 5)) {
          results.recentCommits.push({
            sha: commit.sha.substring(0, 8),
            message: commit.commit.message.split('\n')[0],
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url
          });
          
          console.log(`✅ ${commit.sha.substring(0, 8)}: ${commit.commit.message.split('\n')[0].substring(0, 60)}...`);
          console.log(`   👤 ${commit.commit.author.name} - ${new Date(commit.commit.author.date).toLocaleDateString()}`);
        }
      }

    } catch (error) {
      console.log('❌ GitHub search failed:', error.message);
    }

    return results;
  }

  async getSpecificChangelog() {
    console.log('\n📖 FETCHING MAIN CHANGELOG CONTENT');
    
    try {
      // Try to get the main CHANGELOG.md
      const changelog = await this.githubRequest(`/repos/${this.solanaRepo}/contents/CHANGELOG.md`);
      
      if (changelog && changelog.content) {
        const content = Buffer.from(changelog.content, 'base64').toString('utf8');
        const recentChanges = content.split('\n').slice(0, 50).join('\n');
        
        console.log('✅ Main changelog found');
        console.log('📄 Recent changes preview:');
        console.log(recentChanges.substring(0, 1000) + '...');
        
        return {
          found: true,
          content: recentChanges,
          url: changelog.html_url
        };
      }
    } catch (error) {
      console.log('⚠️ Main changelog not accessible:', error.message);
    }

    return { found: false };
  }

  async generateReport() {
    const searchResults = await this.searchChangelogs();
    const changelogContent = await this.getSpecificChangelog();
    
    const report = {
      timestamp: new Date().toISOString(),
      repository: this.solanaRepo,
      searchResults,
      changelogContent,
      summary: {
        totalReleases: searchResults.releases.length,
        totalChangelogFiles: searchResults.changelogFiles.length,
        totalCommits: searchResults.recentCommits.length,
        latestRelease: searchResults.releases[0]?.tag || 'Unknown'
      }
    };

    // Save report
    if (!fs.existsSync('.cache')) fs.mkdirSync('.cache');
    fs.writeFileSync('.cache/solana-changelog-search.json', JSON.stringify(report, null, 2));

    console.log('\n📊 SEARCH SUMMARY:');
    console.log(`🏷️ Latest Release: ${report.summary.latestRelease}`);
    console.log(`📋 Releases Found: ${report.summary.totalReleases}`);
    console.log(`📄 Changelog Files: ${report.summary.totalChangelogFiles}`);
    console.log(`🔄 Recent Commits: ${report.summary.totalCommits}`);

    console.log('\n🔗 KEY LINKS:');
    if (searchResults.releases[0]) {
      console.log(`📋 Latest Release: ${searchResults.releases[0].url}`);
    }
    console.log(`📂 Repository: https://github.com/${this.solanaRepo}`);
    console.log(`📄 Releases: https://github.com/${this.solanaRepo}/releases`);

    console.log('\n💾 Report saved to .cache/solana-changelog-search.json');
    
    return report;
  }
}

const searcher = new SolanaChangelogSearcher();
searcher.generateReport().catch(console.error);