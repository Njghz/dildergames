import { plural } from "@/lib/utils";

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="badge-red">Нет в наличии</span>;
  }
  if (stock <= 3) {
    return (
      <span className="badge-amber">
        Осталось {stock} {plural(stock, "товар", "товара", "товаров")}
      </span>
    );
  }
  return <span className="badge-green">В наличии</span>;
}
