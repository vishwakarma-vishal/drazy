import Link from "next/link";

export default function Home() {

  return (
    <div>
      <h1>Homepage</h1>

      <div>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/signup">Sign Up</Link>
        <Link href="/signin">Sign In</Link>
      </div>
    </div>
  );
}
