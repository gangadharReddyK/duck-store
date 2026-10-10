export class Money {
  readonly cents: number;

  constructor(cents: number) {
    this.cents = cents;
  }

  plus(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  minus(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  times(n: number): Money {
    return new Money(this.cents * n);
  }

  percentOf(basisPoints: number): Money {
    const numerator = this.cents * basisPoints;
    return new Money(roundHalfAwayFromZero(numerator, 10000));
  }

  static fromDecimal(n: number): Money {
    return new Money(Math.round(n * 100));
  }

  toDecimal(): number {
    return this.cents / 100;
  }
}

function roundHalfAwayFromZero(numerator: number, denominator: number): number {
  const sign = numerator < 0 ? -1 : 1;
  const quotient = Math.trunc(numerator / denominator);
  const remainder = numerator % denominator;
  return quotient + (Math.abs(remainder) * 2 >= denominator ? sign : 0);
}
