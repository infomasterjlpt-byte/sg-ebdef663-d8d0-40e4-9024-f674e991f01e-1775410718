export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="text-primary font-bold">Toki English</span>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 Toki English. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            JLPT is a trademark of the Japan Foundation and Japan Educational Exchanges and Services.
            This app is not affiliated with or endorsed by the Japan Foundation.
          </p>
        </div>
      </div>
    </footer>
  );
}