import AppShell from "./components/AppShell";
import AuthButton from "./components/AuthButton";
import EmailList from "./components/EmailList";
import SummaryButton from "./components/SummaryButton";

export default function Home() {
  return (
    <AppShell>
      <AuthButton />
      <SummaryButton />
      <EmailList />
    </AppShell>
  );
}
