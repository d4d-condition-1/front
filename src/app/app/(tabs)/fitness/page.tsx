import { redirect } from "next/navigation";

export default function FitnessRedirect() {
  redirect("/app/programs");
}
