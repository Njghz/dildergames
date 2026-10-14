import { redirect } from "next/navigation";

export default function NewGamePage() {
  // Форма создания находится в модальном окне на странице /admin/games
  redirect("/admin/games");
}
