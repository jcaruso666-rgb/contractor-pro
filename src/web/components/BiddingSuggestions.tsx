import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Info, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Props {
  projectTotal: number;
}

interface BidStrategy {
  name: string;
  markup: number;
  color: string;
  icon: typeof TrendingDown;
  description: string;
  whenToUse: string;
}

const baseStrategies: BidStrategy[] = [
  {
    name: 'Competitive',
    markup: 12,
    color: 'emerald',
    icon: TrendingDown,
    description: 'Lower margins to win more bids',
    whenToUse: 'Highly competitive markets, new customer acquisition, or slow seasons',
  },
  {
    name: 'Standard',
    markup: 22,
    color: 'sky',
    icon: Target,
    description: 'Balanced approach for steady profits',
    whenToUse: 'Regular projects, existing customers, moderate competition',
  },
  {
    name: 'Premium',
    markup: 35,
    color: 'amber',
    icon: TrendingUp,
    description: 'Higher margins for quality work',
    whenToUse: 'High-end projects, specialized work, low competition, or urgent timelines',
  },
];

export function BiddingSuggestions({ projectTotal }: Props) {
  const [competition, setCompetition] = useState<'low' | 'medium' | 'high'>('medium');
  const [urgency, setUrgency] = useState<'normal' | 'rush'>('normal');
  const [clientType, setClientType] = useState<'new' | 'returning' | 'referral'>('new');

  // Adjust markups based on factors
  const getAdjustedMarkup = (base: number) => {
    let adjustment = 0;
    
    // Competition affects pricing
    if (competition === 'high') adjustment -= 5;
    if (competition === 'low') adjustment += 5;
    
    // Rush jobs command premium
    if (urgency === 'rush') adjustment += 8;
    
    // Client relationship affects pricing
    if (clientType === 'returning') adjustment -= 2;
    if (clientType === 'referral') adjustment -= 3;
    
    return Math.max(5, base + adjustment);
  };

  const strategies = baseStrategies.map(s => ({
    ...s,
    adjustedMarkup: getAdjustedMarkup(s.markup),
  }));

  if (projectTotal <= 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sky-400" />
            Bidding Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">
            Add items to your estimate to see bidding suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-sky-400" />
          Bidding Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Factors */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Competition</Label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value as 'low' | 'medium' | 'high')}
              className="mt-1 w-full h-9 px-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Urgency</Label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as 'normal' | 'rush')}
              className="mt-1 w-full h-9 px-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="normal">Normal</option>
              <option value="rush">Rush Job</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Client Type</Label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as 'new' | 'returning' | 'referral')}
              className="mt-1 w-full h-9 px-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="new">New Customer</option>
              <option value="returning">Returning</option>
              <option value="referral">Referral</option>
            </select>
          </div>
        </div>

        {/* Bid Strategies */}
        <div className="space-y-3">
          {strategies.map(strategy => {
            const Icon = strategy.icon;
            const bidPrice = projectTotal * (1 + strategy.adjustedMarkup / 100);
            const profit = bidPrice - projectTotal;
            const margin = (profit / bidPrice) * 100;
            
            const colorClasses = {
              emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
              sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
              amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
            };
            
            return (
              <div
                key={strategy.name}
                className={`p-4 rounded-lg border ${colorClasses[strategy.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h4 className="font-semibold text-white">{strategy.name}</h4>
                      <p className="text-xs opacity-80">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${bidPrice.toLocaleString()}</p>
                    <p className="text-xs opacity-80">+{strategy.adjustedMarkup}% markup</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs opacity-70">Profit</p>
                    <p className="font-semibold text-white">${profit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Margin</p>
                    <p className="font-semibold text-white">{margin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Cost</p>
                    <p className="font-semibold text-white">${projectTotal.toLocaleString()}</p>
                  </div>
                </div>

                <p className="text-xs mt-3 pt-3 border-t border-white/10 opacity-70">
                  <strong>When to use:</strong> {strategy.whenToUse}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
          <p className="text-xs text-sky-300 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Markups are adjusted based on your market factors. Rush jobs and low competition 
            justify higher margins, while high competition and returning customers may need 
            more competitive pricing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
