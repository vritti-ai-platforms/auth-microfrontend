import type { CreateOrgFormData, OrgPlan as OrgPlanType } from '@schemas/organizations';
import { OrgPlan } from '@schemas/organizations';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { Form } from '@vritti/quantum-ui/Form';
import { Separator } from '@vritti/quantum-ui/Separator';
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
      { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Additional Apps', value: '₹499/app/mo' },
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
    description: 'For growing businesses that need more power, storage, and priority assistance.',
    badge: 'Most Popular',
    badgePrimary: true,
    specs: [
      { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Business Units', value: '3' },
      { icon: <Headphones className="h-3.5 w-3.5" />, label: 'Support', value: 'Priority (Chat + Email)' },
      { icon: <Server className="h-3.5 w-3.5" />, label: 'Infrastructure', value: 'Shared (Optimized)' },
      { icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Storage', value: '200 GB' },
      { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Free Apps', value: '3 included' },
      { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Additional Apps', value: '₹399/app/mo' },
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
      <div className="grid grid-cols-3 gap-4">
        {PLANS.map(({ plan, icon, label, price, period, description, badge, badgePrimary, custom, specs, features, moreFeatures }) => {
          const isSelected = selectedPlan === plan;
          return (
            // relative wrapper so the badge can float above the card
            <div key={plan} className="relative pt-3">
              {badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgePrimary ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}>
                  <Star className="h-3 w-3" />
                  {badge}
                </div>
              )}
              <Card
                className={[
                  'h-full transition-all overflow-hidden',
                  custom ? 'cursor-default' : 'cursor-pointer',
                  !custom && (isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'),
                ].join(' ')}
                onClick={custom ? undefined : () => onSelect(plan)}
              >
                <CardContent className="p-0">
                  {/* Top section — icon, name, price, description */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        {icon}
                      </div>
                      {!custom && isSelected && (
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
                    {custom && (
                      <Button
                        size="sm"
                        className="mt-3 w-full cursor-pointer"
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Contact Sales
                      </Button>
                    )}
                    <Typography variant="body2" intent="muted" className="mt-3">
                      {description}
                    </Typography>
                  </div>

                  <Separator />

                  {/* Specs table */}
                  <div className="space-y-3 p-6">
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

                  <Separator />

                  {/* Features list */}
                  <div className="space-y-2 p-6">
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
                </CardContent>
              </Card>
            </div>
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
