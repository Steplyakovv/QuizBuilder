import { createId } from '../utils/id';
import { MatchingPair } from './quiz.models';

export function addPair(pairs: MatchingPair[]): MatchingPair[] {
  return [...pairs, { id: createId(), left: '', right: '' }];
}

export function removePair(pairs: MatchingPair[], pairId: string): MatchingPair[] {
  return pairs.filter((pair) => pair.id !== pairId);
}

export function updatePairLeft(
  pairs: MatchingPair[],
  pairId: string,
  left: string,
): MatchingPair[] {
  return pairs.map((pair) => (pair.id === pairId ? { ...pair, left } : pair));
}

export function updatePairRight(
  pairs: MatchingPair[],
  pairId: string,
  right: string,
): MatchingPair[] {
  return pairs.map((pair) => (pair.id === pairId ? { ...pair, right } : pair));
}
