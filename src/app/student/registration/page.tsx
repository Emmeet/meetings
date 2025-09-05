import { Metadata } from "next";
import { StudentRegistrationForm } from "../component/StudentRegistrationForm";

export default function page() {
  return (
    <>
      <StudentRegistrationForm />
    </>
  );
}

export const metadata: Metadata = {
  title: "Asiacrypt 2025 Student speaker's registration waiver request",
  description: "Asiacrypt 2025 Student speaker's registration waiver request",
};
