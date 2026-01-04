const Footer = () => {
  return (
    <footer className="bg-brand-surface-secondary border-t border-border-default pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold tracking-tight text-brand-text-primary">PrintZap</span>
            <p className="mt-2 text-sm text-brand-text-muted">
              Connects you to the nearest, cheapest, and fastest print shops instantly.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-brand-text-muted hover:text-brand-text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-brand-text-muted hover:text-brand-text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="text-brand-text-muted hover:text-brand-text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-divider-light text-center">
          <p className="text-sm text-brand-text-disabled">© 2025 PrintZap. Built for students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
