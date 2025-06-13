import AppShell from "./components/AppShell";
import AuthButton from "./components/AuthButton";
import EmailList from "./components/EmailList";

export default function Home() {
  return (
    <AppShell>
      <AuthButton />
      <EmailList />
    </AppShell>
  );
}
