export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">FinBoard</h1>
        <p className="text-muted-foreground text-sm">Finance Dashboard</p>
      </header>

      <div className="border border-dashed border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Dashboard widgets will appear here</p>
      </div>
    </main>
  );
}
