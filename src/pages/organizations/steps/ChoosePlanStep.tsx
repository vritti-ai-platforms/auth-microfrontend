import type { CreateOrgFormData, OrgPlan as OrgPlanType } from '@schemas/organizations';
import { OrgPlan } from '@schemas/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Typography } from '@vritti/quantum-ui/Typography';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Crown,
  CreditCard,
  HardDrive,
  Headphones,
  LayoutGrid,
  Lock,
  Rocket,
  Server,
  Star,
  Zap,
} from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface Spec {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface PlanDef {
  plan: OrgPlanType;
  icon: React.ReactNode;
  label: string;
  price: string;
  period: string;
  promo?: string;
  description: string;
  badge: string | null;
  badgePrimary?: boolean;
  custom?: boolean;
  specs: Spec[];
  features: readonly string[];
  moreFeatures: number;
}

const PLANS: PlanDef[] = [
  {
    plan: OrgPlan.free,
    icon: <Zap className="h-5 w-5 text-primary-foreground" />,
    label: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for individuals and small teams just getting started with Vritti',
    badge: null,
    specs: [
      { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Business Units', value: '1' },
      { icon: <Headphones className="h-3.5 w-3.5" />, label: 'Support', value: 'Basic (Email)' },
      { icon: <Server className="h-3.5 w-3.5" />, label: 'Infrastructure', value: 'Shared' },
      { icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Storage', value: '30 GB' },
      { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Free Apps', value: '1 included' },
      { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Additional Apps', value: 'Varies per app' },
    ],
    features: [
      'Community forum access',
      'Basic analytics & reports',
      'Standard API rate limits',
      'Email notifications',
    ],
    moreFeatures: 0,
  },
  {
    plan: OrgPlan.pro,
    icon: <Crown className="h-5 w-5 text-primary-foreground" />,
    label: 'Pro',
    price: '₹2,999',
    period: '/month',
    promo: 'First 3 months free',
    description: 'For growing businesses that need more power, storage, and priority assistance.',
    badge: 'Most Popular',
    badgePrimary: true,
    specs: [
      { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Business Units', value: '3' },
      { icon: <Headphones className="h-3.5 w-3.5" />, label: 'Support', value: 'Priority (Chat + Email)' },
      { icon: <Server className="h-3.5 w-3.5" />, label: 'Infrastructure', value: 'Shared (Optimized)' },
      { icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Storage', value: '200 GB' },
      { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Free Apps', value: '3 included' },
      { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Additional Apps', value: 'Varies per app' },
    ],
    features: [
      'Advanced analytics & dashboards',
      'Higher API rate limits',
      'Webhook integrations',
      'Custom branding',
    ],
    moreFeatures: 1,
  },
  {
    plan: OrgPlan.enterprise,
    icon: <Rocket className="h-5 w-5 text-primary-foreground" />,
    label: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations requiring dedicated resources, compliance, and scale.',
    badge: 'Best Value',
    custom: true,
    specs: [
      { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Business Units', value: 'Unlimited' },
      { icon: <Headphones className="h-3.5 w-3.5" />, label: 'Support', value: '24/7 Dedicated Manager' },
      { icon: <Server className="h-3.5 w-3.5" />, label: 'Infrastructure', value: 'Dedicated (Isolated)' },
      { icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Storage', value: '1 TB' },
      { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Free Apps', value: 'All apps included' },
      { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Additional Apps', value: 'Included' },
    ],
    features: [
      'SSO & advanced security',
      'Custom SLA (99.95% uptime)',
      'Audit logs & compliance',
      'Dedicated account manager',
    ],
    moreFeatures: 3,
  },
];

interface ChoosePlanStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  selectedPlan: OrgPlanType;
  onSelect: (plan: OrgPlanType) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ChoosePlanStep: React.FC<ChoosePlanStepProps> = ({ form, selectedPlan, onSelect, onBack, onContinue }) => {
  return (
    <Form form={form} onSubmit={onContinue}>
      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        No credit card required for trial
      </div>
      {/* mobile: single column stack; desktop: 3-col subgrid with aligned sections */}
      <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-0 lg:grid-rows-[auto_1px_auto_1px_auto]">
        {PLANS.map(({ plan, icon, label, price, period, promo, description, badge, badgePrimary, custom, specs, features, moreFeatures }) => {
          const isSelected = selectedPlan === plan;
          const sharedClass = 'group relative pt-3 min-w-[280px] lg:row-span-5 lg:grid lg:grid-rows-subgrid';

          // Inner content shared between the button and div wrappers
          const cardInner = (
            <>
              {/* Badge floats above the card in the pt-3 space */}
              {badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgePrimary ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}>
                  <Star className="h-3 w-3" />
                  {badge}
                </div>
              )}

              {/* Card visual — absolute so it doesn't participate in subgrid rows */}
              <div className={[
                'pointer-events-none absolute inset-x-0 top-3 bottom-0 rounded-xl border bg-card transition-all',
                isSelected ? 'ring-2 ring-primary' : 'group-hover:border-primary/50',
              ].join(' ')} />

              {/* Row 1 — icon, name, price, description */}
              <div className="flex flex-col p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    {icon}
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <Typography variant="h4">{label}</Typography>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{price}</span>
                  {period && <span className="text-sm text-muted-foreground">{period}</span>}
                </div>
                {promo && (
                  <span className="mt-1.5 inline-block rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                    {promo}
                  </span>
                )}
                {custom && (
                  <Button size="sm" className="mt-3 w-full cursor-pointer" type="button" onClick={(e) => { e.stopPropagation(); window.open('https://vrittiai.com', '_blank'); }}>
                    Contact Sales
                  </Button>
                )}
                <Typography variant="body2" intent="muted" className="mt-auto pt-3">
                  {description}
                </Typography>
              </div>

              {/* Row 2 — separator */}
              <div className="h-px bg-border relative z-10" />

              {/* Row 3 — specs table */}
              <div className="space-y-3 p-6 relative z-10">
                {specs.map(({ icon: specIcon, label: specLabel, value }) => (
                  <div key={specLabel} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {specIcon}
                      {specLabel}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Row 4 — separator */}
              <div className="h-px bg-border relative z-10" />

              {/* Row 5 — features list */}
              <div className="space-y-2 p-6 relative z-10">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{f}</span>
                  </div>
                ))}
                {moreFeatures > 0 && (
                  <span className="pl-5 text-sm text-muted-foreground">+{moreFeatures} more features</span>
                )}
              </div>
            </>
          );

          // Enterprise is not selectable — use div; others use button for a11y
          if (custom) {
            return (
              <div key={plan} className={`${sharedClass} cursor-default`}>
                {cardInner}
              </div>
            );
          }

          return (
            <button key={plan} type="button" className={`${sharedClass} cursor-pointer text-left`} onClick={() => onSelect(plan)}>
              {cardInner}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
