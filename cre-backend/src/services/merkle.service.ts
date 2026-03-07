import { ethers } from 'ethers';
import logger from '../utils/logger.js';

interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
}

class MerkleService {
  /**
   * Hash a raw string leaf into a proper 32-byte keccak256 hex value.
   * This ensures leaves are always valid bytes32 before being used in the tree.
   */
  static hashLeaf(value: string): string {
    // If it's already a valid 32-byte hex, use it directly
    if (/^0x[0-9a-fA-F]{64}$/.test(value)) {
      return value;
    }
    // Otherwise hash the UTF-8 encoded string
    return ethers.keccak256(ethers.toUtf8Bytes(value));
  }

  static hashPair(left: string, right: string): string {
    return ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [left, right]);
  }

  static verifyProof(proof: MerkleProof): boolean {
    try {
      let current = this.hashLeaf(proof.leaf);

      for (const sibling of proof.proof) {
        const siblingHash = this.hashLeaf(sibling);
        // Sort to ensure deterministic ordering
        const [l, r] =
          current.toLowerCase() < siblingHash.toLowerCase()
            ? [current, siblingHash]
            : [siblingHash, current];

        current = this.hashPair(l, r);
      }

      const isValid = current.toLowerCase() === proof.root.toLowerCase();
      logger.debug(
        {
          leaf: proof.leaf,
          computed: current,
          root: proof.root,
          isValid,
        },
        'Merkle proof verification'
      );
      return isValid;
    } catch (error) {
      logger.error({ error }, 'Merkle proof verification failed');
      return false;
    }
  }

  static buildTree(leaves: string[]): string[] {
    if (leaves.length === 0) {
      throw new Error('Cannot build tree from empty leaves');
    }

    // Hash all leaves first so they are valid bytes32
    let currentLevel = leaves.map((l) => this.hashLeaf(l));

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate last if odd

        nextLevel.push(this.hashPair(left, right));
      }

      currentLevel = nextLevel;
    }

    return currentLevel;
  }

  static getProof(leaves: string[], index: number): string[] {
    if (index >= leaves.length) {
      throw new Error('Index out of bounds');
    }

    const proof: string[] = [];
    // Hash all leaves first
    let currentLevel = leaves.map((l) => this.hashLeaf(l));
    let currentIndex = index;

    while (currentLevel.length > 1) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < currentLevel.length) {
        proof.push(currentLevel[siblingIndex]);
      }

      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        nextLevel.push(this.hashPair(left, right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  static getRoot(leaves: string[]): string {
    const tree = this.buildTree(leaves);
    return tree[0];
  }
}

export default MerkleService;
