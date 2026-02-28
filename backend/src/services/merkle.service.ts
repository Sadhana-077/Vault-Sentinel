import { ethers } from 'ethers';
import logger from '../utils/logger.js';

interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
}

class MerkleService {
  static hashPair(left: string, right: string): string {
    return ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [left, right]);
  }

  static verifyProof(proof: MerkleProof): boolean {
    try {
      let current = proof.leaf;

      for (const sibling of proof.proof) {
        // Sort to ensure deterministic ordering
        const [left, right] =
          current.toLowerCase() < sibling.toLowerCase()
            ? [current, sibling]
            : [sibling, current];

        current = this.hashPair(left, right);
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

    let currentLevel = [...leaves];

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
    let currentLevel = [...leaves];
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
