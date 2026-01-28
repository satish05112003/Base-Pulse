import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidAddress } from '@/lib/reputation';
import { cn } from '@/lib/utils';

export function WalletInput() {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidAddress(trimmedAddress)) {
      setError('Invalid wallet address format');
      return;
    }

    setIsLoading(true);
    
    // Navigate to results page
    navigate(`/${trimmedAddress}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
        
        <div className="relative flex gap-2 p-2 glass rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter Base wallet address (0x...)"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              className={cn(
                "pl-10 h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base",
                "placeholder:text-muted-foreground/60"
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className={cn(
              "h-12 px-6 bg-gradient-to-r from-primary to-secondary",
              "hover:opacity-90 transition-opacity",
              "font-semibold text-primary-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Check
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive text-center">{error}</p>
      )}

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Example: 0x1234...abcd
      </p>
    </form>
  );
}
