import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function TwitterButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href="https://x.com/cryptishx"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full glass border border-border/50 hover:border-primary/50 transition-all duration-300 group"
        >
          {/* X/Twitter logo */}
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-foreground group-hover:text-primary transition-colors"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
            @cryptishx
          </span>
        </a>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Follow the builder on X</p>
      </TooltipContent>
    </Tooltip>
  );
}
