export class Member {
  private id: number;
  private code: string;
  private name: string;
  private borrowedBooksCount: number;
  private isPenalized: boolean;
  private createdAt: Date;

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getCode(): string {
    return this.code;
  }

  public setCode(code: string): void {
    this.code = code;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getBorrowedBooksCount(): number {
    return this.borrowedBooksCount;
  }

  public setBorrowedBooksCount(borrowedBooksCount: number): void {
    this.borrowedBooksCount = borrowedBooksCount;
  }

  public getIsPenalized(): boolean {
    return this.isPenalized;
  }

  public setIsPenalized(isPenalized: boolean): void {
    this.isPenalized = isPenalized;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }
}
