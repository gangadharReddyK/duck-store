import { Money } from '../domain/money.js';

/** Result of resolving the lowest-priced active duck. */
export interface PriceResolutionResult {
  /** Unit price of the matched duck (lowest price among active lots with sufficient quantity). */
  price: Money;
}