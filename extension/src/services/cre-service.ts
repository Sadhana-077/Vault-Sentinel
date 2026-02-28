import { ExchangeData, ReserveData, LiabilityData } from '../types'

/**
 * CRE Service - Integrates with Chainlink Cryptographic Proof of Reserve
 * Fetches real exchange solvency data and verifies merkle proofs
 */
export class CREService {
  private baseUrl = 'https://api.chainlink.com/cre'
  private wasmUrl = 'https://cre.chainlink.com/wasm'

  /**
   * Fetch reserve data for an exchange from CRE
   */
  async fetchExchangeReserve(exchangeName: string): Promise<ReserveData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/reserves/${exchangeName.toLowerCase()}`,
        { signal: AbortSignal.timeout(10000) }
      )
      
      if (!response.ok) {
        throw new Error(`CRE API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        exchange: exchangeName,
        totalReserves: data.totalReserves || 0,
        assets: data.assets || [],
        lastUpdated: new Date(data.lastUpdated),
        merkleRoot: data.merkleRoot,
        merkleProof: data.merkleProof,
        signatureTimestamp: data.signatureTimestamp,
      }
    } catch (error) {
      console.error(`[VaultSentinel] Failed to fetch reserves for ${exchangeName}:`, error)
      throw error
    }
  }

  /**
   * Fetch liability data for an exchange
   */
  async fetchExchangeLiabilities(exchangeName: string): Promise<LiabilityData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/liabilities/${exchangeName.toLowerCase()}`,
        { signal: AbortSignal.timeout(10000) }
      )
      
      if (!response.ok) {
        throw new Error(`CRE API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        exchange: exchangeName,
        totalLiabilities: data.totalLiabilities || 0,
        userBalances: data.userBalances || {},
        lastUpdated: new Date(data.lastUpdated),
        merkleRoot: data.merkleRoot,
        merkleTreePath: data.merkleTreePath,
      }
    } catch (error) {
      console.error(`[VaultSentinel] Failed to fetch liabilities for ${exchangeName}:`, error)
      throw error
    }
  }

  /**
   * Verify merkle proof for reserve data
   */
  async verifyMerkleProof(
    exchangeName: string,
    reserve: ReserveData
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.wasmUrl}/verify-merkle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeName,
          merkleRoot: reserve.merkleRoot,
          merkleProof: reserve.merkleProof,
          data: reserve.totalReserves,
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      return result.verified === true
    } catch (error) {
      console.error(`[VaultSentinel] Merkle verification failed for ${exchangeName}:`, error)
      return false
    }
  }

  /**
   * Fetch all exchanges data in parallel
   */
  async fetchAllExchanges(exchangeNames: string[]): Promise<ExchangeData[]> {
    const promises = exchangeNames.map(async (name) => {
      try {
        const [reserves, liabilities] = await Promise.all([
          this.fetchExchangeReserve(name),
          this.fetchExchangeLiabilities(name),
        ])

        const isVerified = await this.verifyMerkleProof(name, reserves)

        const solvencyRatio = reserves.totalReserves / (liabilities.totalLiabilities || 1)

        return {
          name,
          reserves,
          liabilities,
          solvencyRatio,
          isVerified,
          status: this.calculateStatus(solvencyRatio),
          lastUpdated: new Date(),
        }
      } catch (error) {
        console.error(`[VaultSentinel] Error fetching data for ${name}:`, error)
        return null
      }
    })

    const results = await Promise.all(promises)
    return results.filter((r): r is ExchangeData => r !== null)
  }

  /**
   * Calculate solvency status based on ratio
   */
  private calculateStatus(ratio: number): 'healthy' | 'warning' | 'critical' {
    if (ratio >= 1.0) return 'healthy'
    if (ratio >= 0.95) return 'warning'
    return 'critical'
  }

  /**
   * Get on-chain verification details
   */
  async getOnChainVerification(exchangeName: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/on-chain/${exchangeName.toLowerCase()}`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch on-chain data')
      }

      return await response.json()
    } catch (error) {
      console.error(`[VaultSentinel] On-chain verification failed:`, error)
      return null
    }
  }
}

export const creService = new CREService()
