import ThemeToggle from "./components/ThemeToggle";
import AuthButton from "./components/AuthButton";
import EmailList from "./components/EmailList";

export default function Home() {
  return (
    <main>
      <ThemeToggle />
      <h1 style={{ marginBottom: 24 }}>Smart AI Email</h1>
      <AuthButton />
      <EmailList />
    </main>
  );
}
