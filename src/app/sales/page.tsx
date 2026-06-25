import { redirect } from "next/navigation";

/**
 * `/sales` is the named door for the Sales workspace from /home.
 * The Sales builder itself lives at /admin?audience=sales — this
 * just forwards there so the /home card has a clean URL.
 */
export default function SalesEntry() {
  redirect("/admin?audience=sales");
}
