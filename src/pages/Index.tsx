import { Shield, Zap, Eye, Lock } from 'lucide-react';
import { WalletInput } from '@/components/WalletInput';

const features = [
  {
    icon: Shield,
    title: 'Trust Score',
    description: 'Get an instant reputation score based on on-chain activity',
  },
  {
    icon: Zap,
    title: 'Real-time Analysis',
    description: 'Analyze any Base wallet in seconds with live blockchain data',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    description: 'See the complete breakdown of how the score is calculated',
  },
  {
    icon: Lock,
    title: 'No Wallet Connect',
    description: 'Paste any address - no signatures or connections required',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Logo / Brand */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Base Mainnet</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Wallet Reputation</span>
            <br />
            <span className="text-foreground">Score</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Instantly analyze any Base wallet's on-chain reputation. 
            No connections, no signatures – just paste and check.
          </p>

          {/* Wallet Input */}
          <WalletInput />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="glass rounded-xl p-5 transition-all duration-300 hover:border-primary/30"
            >
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Built for the Base ecosystem</p>
          <p>Read-only • No wallet connection required</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
