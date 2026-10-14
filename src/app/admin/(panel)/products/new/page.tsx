import { redirect } from "next/navigation";

export default function NewProductPage() {
  // Форма создания находится в модальном окне на странице /admin/products
  redirect("/admin/products");
}
