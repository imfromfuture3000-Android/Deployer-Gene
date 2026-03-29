/**
 * HELIUS PAGINATION MODULE
 * Comprehensive pagination system for Helius RPC API
 * Supports: Token balances, transaction history, program accounts, NFTs, DAS API
 * 
 * Features:
 * - Cursor-based & limit-offset pagination
 * - Automatic retry with exponential backoff
 * - Rate limiting (Helius: 100 RPS default)
 * - Batch processing for large datasets
 * - Stream-based processing for memory efficiency
 * - Full error handling & logging
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const EventEmitter = require('events');

class HeliusPaginationClient extends EventEmitter {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.HELIUS_API_KEY;
    this.baseUrl = config.baseUrl || 'https://api.helius.xyz/v0';
    this.rpcUrl = config.rpcUrl || `https://beta.helius-rpc.com/?api-key=${this.apiKey}`;
    
    // Rate limiting
    this.rateLimit = config.rateLimit || 100; // RPS
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.activeRequests = 0;
    
    // Retry policy
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000; // ms
    this.backoffMultiplier = config.backoffMultiplier || 2;
    
    // Pagination defaults
    this.defaultLimit = config.defaultLimit || 100;
    this.maxLimit = config.maxLimit || 1000;
    
    // Logging
    this.debug = config.debug || false;
    this.logger = config.logger || console;
    
    this.stats = {
      totalRequests: 0,
      totalRetries: 0,
      totalErrors: 0,
      totalBytes: 0,
      startTime: Date.now()
    };
  }

  /**
   * LOG WITH DEBUG SUPPORT
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    if (this.debug || level === 'ERROR') {
      this.logger.log(logEntry, data);
    }
    
    this.emit('log', { level, message, data, timestamp });
  }

  /**
   * RATE LIMITING - Respect Helius rate limits
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minIntervalMs = 1000 / this.rateLimit;
    
    if (timeSinceLastRequest < minIntervalMs) {
      const delayMs = minIntervalMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * RETRY WITH EXPONENTIAL BACKOFF
   */
  async retryWithBackoff(fn, attempt = 0) {
    try {
      await this.enforceRateLimit();
      return await fn();
    } catch (error) {
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(this.backoffMultiplier, attempt);
        this.log('WARN', `Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`, { error: error.message });
        this.stats.totalRetries++;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, attempt + 1);
      }
      
      this.stats.totalErrors++;
      throw error;
    }
  }

  /**
   * GENERIC PAGINATED REQUEST
   */
  async paginatedRequest(endpoint, params = {}, options = {}) {
    const {
      paginationType = 'cursor', // 'cursor' or 'limit-offset'
      pageCallback = null,
      streamMode = false,
      maxPages = null,
      accumulate = false
    } = options;

    const results = accumulate ? [] : null;
    let pageCount = 0;
    let cursor = null;
    let offset = 0;

    try {
      while (true) {
        pageCount++;
        
        if (maxPages && pageCount > maxPages) {
          this.log('INFO', `Reached max pages limit: ${maxPages}`);
          break;
        }

        // Build request params
        const requestParams = { ...params };
        
        if (paginationType === 'cursor') {
          if (cursor) requestParams.after = cursor;
        } else {
          requestParams.offset = offset;
          requestParams.limit = params.limit || this.defaultLimit;
        }

        // Execute request with retry
        const response = await this.retryWithBackoff(async () => {
          return await this.makeRequest(endpoint, requestParams);
        });

        this.stats.totalRequests++;
        this.stats.totalBytes += JSON.stringify(response).length;

        // Handle page data
        const pageData = response.result || response;
        const itemsInPage = Array.isArray(pageData) ? pageData.length : 
                           pageData.items ? pageData.items.length : 0;

        this.log('INFO', `Page ${pageCount}: ${itemsInPage} items`, { endpoint, hasMore: response.pagination?.pageKey || false });

        if (pageCallback) {
          await pageCallback(pageData, pageCount);
        }

        if (accumulate && pageData) {
          if (Array.isArray(pageData)) {
            results.push(...pageData);
          } else if (pageData.items) {
            results.push(...pageData.items);
          } else {
            results.push(pageData);
          }
        }

        // Check for pagination continuation
        if (paginationType === 'cursor') {
          cursor = response.pagination?.pageKey;
          if (!cursor) break;
        } else {
          offset += requestParams.limit;
          
          // Check if we got fewer items than requested (last page)
          if (itemsInPage < (requestParams.limit || this.defaultLimit)) {
            break;
          }
        }

        this.emit('page', { pageCount, itemsInPage, endpoint });
      }

      this.log('INFO', `Pagination complete: ${pageCount} pages fetched`, { endpoint });
      return accumulate ? results : { pagesProcessed: pageCount };

    } catch (error) {
      this.log('ERROR', `Pagination failed at page ${pageCount}`, { endpoint, error: error.message });
      throw error;
    }
  }

  /**
   * MAKE RAW REQUEST TO HELIUS API
   */
  async makeRequest(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Ralph-Agent-Bot/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Helius API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * GET TOKEN BALANCES (PAGINATED)
   * Returns all token balances for a wallet with pagination
   */
  async getTokenBalances(walletAddress, options = {}) {
    const { includeNative = true, maxPages = null } = options;

    const results = [];

    await this.paginatedRequest(
      `/addresses/${walletAddress}/balances`,
      { native: includeNative },
      {
        paginationType: 'limit-offset',
        maxPages,
        pageCallback: async (pageData) => {
          const tokens = pageData.tokens || [];
          results.push(...tokens);
          this.emit('tokens', { walletAddress, count: tokens.length, total: results.length });
        }
      }
    );

    return {
      address: walletAddress,
      native: pageData?.nativeBalance,
      tokens: results,
      totalCount: results.length,
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * GET TRANSACTION HISTORY (PAGINATED)
   * Returns all transactions for a wallet with full pagination
   */
  async getTransactionHistory(walletAddress, options = {}) {
    const {
      limit = 100,
      until = null,
      type = null,
      maxPages = null
    } = options;

    const results = [];

    await this.paginatedRequest(
      `/addresses/${walletAddress}/transactions`,
      { limit, ...(until && { until }) },
      {
        paginationType: 'cursor',
        maxPages,
        pageCallback: async (pageData) => {
          const transactions = pageData || [];
          results.push(...transactions);
          this.emit('transactions', { 
            walletAddress, 
            count: transactions.length, 
            total: results.length 
          });
        }
      }
    );

    // Filter by type if requested
    let filtered = results;
    if (type) {
      filtered = results.filter(tx => tx.type === type);
    }

    return {
      address: walletAddress,
      transactions: filtered,
      totalCount: filtered.length,
      types: [...new Set(results.map(tx => tx.type))],
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * GET PROGRAM ACCOUNTS (PAGINATED)
   * Returns all accounts owned by a program with pagination
   */
  async getProgramAccounts(programAddress, options = {}) {
    const {
      pageSize = 100,
      maxPages = null,
      filters = []
    } = options;

    const results = [];

    // Build RPC-style request for getProgramAccounts
    const rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [
        programAddress,
        {
          encoding: 'jsonParsed',
          dataSlice: { offset: 0, length: 0 },
          filters: filters || []
        }
      ]
    };

    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcRequest)
    });

    const data = await response.json();
    const allAccounts = data.result || [];

    // Manual pagination of results
    let pageCount = 0;
    for (let i = 0; i < allAccounts.length; i += pageSize) {
      pageCount++;
      
      if (maxPages && pageCount > maxPages) break;

      const page = allAccounts.slice(i, i + pageSize);
      results.push(...page);
      
      this.emit('accounts', { 
        programAddress, 
        page: pageCount, 
        pageSize: page.length, 
        totalFetched: results.length 
      });

      this.log('INFO', `Program accounts page ${pageCount}: ${page.length} accounts`);
    }

    return {
      programAddress,
      accounts: results,
      totalCount: results.length,
      pageCount,
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * GET NFT COLLECTION (PAGINATED)
   * Returns all NFTs in a collection with pagination
   */
  async getNFTCollection(collectionAddress, options = {}) {
    const {
      pageSize = 100,
      maxPages = null
    } = options;

    const results = [];
    let offset = 0;

    while (true) {
      const response = await this.retryWithBackoff(async () => {
        return await this.makeRequest(
          `/v0/nft/getCollectionNFTs?collectionAddress=${collectionAddress}&offset=${offset}&limit=${pageSize}`
        );
      });

      const nfts = response.nfts || [];
      if (nfts.length === 0) break;

      results.push(...nfts);
      
      this.emit('nfts', { 
        collection: collectionAddress, 
        pageSize: nfts.length, 
        total: results.length 
      });

      offset += pageSize;
      
      if (maxPages && Math.ceil(results.length / pageSize) >= maxPages) break;
    }

    return {
      collection: collectionAddress,
      nfts: results,
      totalCount: results.length,
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * STREAM PROCESSING FOR LARGE DATASETS
   * Memory-efficient processing with callback per item
   */
  async streamProcess(endpoint, params = {}, itemCallback, options = {}) {
    let itemCount = 0;

    await this.paginatedRequest(endpoint, params, {
      paginationType: options.paginationType || 'cursor',
      maxPages: options.maxPages,
      pageCallback: async (pageData) => {
        const items = Array.isArray(pageData) ? pageData : pageData.items || [];
        
        for (const item of items) {
          itemCount++;
          await itemCallback(item, itemCount);
        }
      }
    });

    return { itemsProcessed: itemCount };
  }

  /**
   * BATCH PROCESSING
   * Process large datasets in batches with optional delay
   */
  async batchProcess(addresses, processor, options = {}) {
    const {
      batchSize = 10,
      delayMs = 100
    } = options;

    const results = [];

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(addr => processor(addr))
      );
      
      results.push(...batchResults);
      
      this.emit('batch', { batchIndex: Math.floor(i / batchSize), batchSize: batch.length });
      
      if (i + batchSize < addresses.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * GET STATISTICS
   */
  getStats() {
    const elapsedSeconds = (Date.now() - this.stats.startTime) / 1000;
    
    return {
      ...this.stats,
      elapsedSeconds,
      avgRequestsPerSecond: (this.stats.totalRequests / elapsedSeconds).toFixed(2),
      avgBytesPerRequest: Math.round(this.stats.totalBytes / this.stats.totalRequests),
      retryRate: ((this.stats.totalRetries / this.stats.totalRequests) * 100).toFixed(2) + '%',
      errorRate: ((this.stats.totalErrors / this.stats.totalRequests) * 100).toFixed(2) + '%'
    };
  }

  /**
   * RESET STATISTICS
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      totalRetries: 0,
      totalErrors: 0,
      totalBytes: 0,
      startTime: Date.now()
    };
  }
}

module.exports = HeliusPaginationClient;
