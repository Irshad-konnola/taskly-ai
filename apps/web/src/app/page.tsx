import { loginSchema } from "@taskly/shared";

export default function HomePage() {
  // If VS Code gives you autocomplete when you hover over 'loginSchema', 
  // your TypeScript types are perfectly linked!
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Taskly AI Frontend</h1>
      <p>
        The shared package requires a password to be at least{" "}
        <strong>{loginSchema.shape.password.minLength}</strong> character(s) long.
      </p>
    </div>
  );
}