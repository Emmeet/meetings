import { Metadata } from "next";
import { StudentTravelForm } from "../component/StudentTravelForm";

export default function page() {
  return (
    <>
      <StudentTravelForm />
    </>
  );
}

export const metadata: Metadata = {
  title: "AsiaCrypt 2025 - Student Travel Stipend Request",
  description: "AsiaCrypt 2025 - Student Travel Stipend Request",
};
