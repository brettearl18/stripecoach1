'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pricingService } from '@/lib/services/pricingService';
import { PricingPlan, Discount, Subscription } from '@/types/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function PricingManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');

  // State for plans, discounts, and subscriptions
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Form states
  const [planForm, setPlanForm] = useState<Partial<PricingPlan>>({
    name: '',
    description: '',
    price: {
      amount: 0,
      currency: 'USD',
      interval: 'month'
    },
    features: [],
    limits: {
      maxClients: 0,
      maxCoaches: 0,
      maxStorage: 0,
      maxApiCalls: 0
    },
    metadata: {
      isPopular: false,
      isCustom: false,
      trialDays: 0,
      setupFee: 0
    }
  });

  const [discountForm, setDiscountForm] = useState<Partial<Discount>>({
    code: '',
    type: 'percentage',
    value: 0,
    startDate: new Date(),
    endDate: new Date(),
    conditions: {
      firstTimeOnly: false
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, discountsData] = await Promise.all([
        pricingService.listPlans(),
        pricingService.getDiscounts()
      ]);
      setPlans(plansData);
      setDiscounts(discountsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const newPlan = await pricingService.createPlan(planForm as Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>);
      setPlans([...plans, newPlan]);
      toast.success('Plan created successfully');
      setPlanForm({
        name: '',
        description: '',
        price: {
          amount: 0,
          currency: 'USD',
          interval: 'month'
        },
        features: [],
        limits: {
          maxClients: 0,
          maxCoaches: 0,
          maxStorage: 0,
          maxApiCalls: 0
        },
        metadata: {
          isPopular: false,
          isCustom: false,
          trialDays: 0,
          setupFee: 0
        }
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
    }
  };

  const handleCreateDiscount = async () => {
    try {
      const newDiscount = await pricingService.createDiscount(discountForm as Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>);
      setDiscounts([...discounts, newDiscount]);
      toast.success('Discount created successfully');
      setDiscountForm({
        code: '',
        type: 'percentage',
        value: 0,
        startDate: new Date(),
        endDate: new Date(),
        conditions: {
          firstTimeOnly: false
        }
      });
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('Failed to create discount');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pricing Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Create Pricing Plan</CardTitle>
              <CardDescription>Define a new pricing plan with features and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      value={planForm.price?.amount}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        price: { ...planForm.price!, amount: parseFloat(e.target.value) }
                      })}
                    />
                    <Select
                      value={planForm.price?.currency}
                      onValueChange={(value) => setPlanForm({
                        ...planForm,
                        price: { ...planForm.price!, currency: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={planForm.price?.interval}
                      onValueChange={(value) => setPlanForm({
                        ...planForm,
                        price: { ...planForm.price!, interval: value as 'month' | 'year' }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Limits</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Clients</Label>
                      <Input
                        type="number"
                        value={planForm.limits?.maxClients}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits!, maxClients: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Coaches</Label>
                      <Input
                        type="number"
                        value={planForm.limits?.maxCoaches}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          limits: { ...planForm.limits!, maxCoaches: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Metadata</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.metadata?.isPopular}
                        onCheckedChange={(checked) => setPlanForm({
                          ...planForm,
                          metadata: { ...planForm.metadata!, isPopular: checked }
                        })}
                      />
                      <Label>Popular Plan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.metadata?.isCustom}
                        onCheckedChange={(checked) => setPlanForm({
                          ...planForm,
                          metadata: { ...planForm.metadata!, isCustom: checked }
                        })}
                      />
                      <Label>Custom Plan</Label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreatePlan}>Create Plan</Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Existing Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        {plan.price.currency} {plan.price.amount}
                        <span className="text-sm text-gray-500">/{plan.price.interval}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {feature.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle>Create Discount</CardTitle>
              <CardDescription>Define a new discount code with conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Discount Code</Label>
                  <Input
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <Select
                    value={discountForm.type}
                    onValueChange={(value) => setDiscountForm({
                      ...discountForm,
                      type: value as 'percentage' | 'fixed'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({
                      ...discountForm,
                      value: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Conditions</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={discountForm.conditions?.firstTimeOnly}
                        onCheckedChange={(checked) => setDiscountForm({
                          ...discountForm,
                          conditions: { ...discountForm.conditions!, firstTimeOnly: checked }
                        })}
                      />
                      <Label>First-time customers only</Label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreateDiscount}>Create Discount</Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Existing Discounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount) => (
                <Card key={discount.id}>
                  <CardHeader>
                    <CardTitle>{discount.code}</CardTitle>
                    <CardDescription>
                      {discount.type === 'percentage' ? `${discount.value}% off` : `${discount.value} off`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Valid until: {new Date(discount.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Usage: {discount.usageCount} / {discount.usageLimit || 'Unlimited'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Active Subscriptions</h2>
            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardHeader>
                    <CardTitle>Subscription #{subscription.id}</CardTitle>
                    <CardDescription>
                      Status: {subscription.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        Plan: {subscription.planId}
                      </p>
                      <p>
                        Price: {subscription.price.currency} {subscription.price.amount}
                      </p>
                      <p>
                        Period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                      {subscription.discount && (
                        <p>
                          Discount: {subscription.discount.code} ({subscription.discount.amount})
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 