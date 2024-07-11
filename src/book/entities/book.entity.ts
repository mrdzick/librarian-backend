export class Book {
  private id: number;
  private code: string;
  private title: string;
  private author: string;
  private stock: number;
  private createdAt: Date;

  setId(id: number): void {
    this.id = id;
  }

  getId(): number {
    return this.id;
  }

  setCode(code: string): void {
    this.code = code;
  }

  getCode(): string {
    return this.code;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  getTitle(): string {
    return this.title;
  }

  setAuthor(author: string): void {
    this.author = author;
  }

  getAuthor(): string {
    return this.author;
  }

  setStock(stock: number): void {
    this.stock = stock;
  }

  getStock(): number {
    return this.stock;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
