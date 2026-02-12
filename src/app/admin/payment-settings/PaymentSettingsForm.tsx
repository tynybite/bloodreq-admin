'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updatePaymentSettings } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentSettingsFormProps {
    initialBkash: any;
    initialPaypal: any;
    initialCryptomus: any;
    initialStripe: any;
}

export default function PaymentSettingsForm({ initialBkash, initialPaypal, initialCryptomus, initialStripe }: PaymentSettingsFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [bkash, setBkash] = useState(initialBkash || {
        enabled: false,
        username: "",
        password: "",
        appKey: "",
        appSecret: "",
        isSandbox: true,
    });
    
    const [paypal, setPaypal] = useState(initialPaypal || {
        enabled: false,
        clientId: "",
        clientSecret: "",
        mode: "sandbox", 
    });

    const [cryptomus, setCryptomus] = useState(initialCryptomus || {
        enabled: false,
        merchantId: "",
        apiKey: "",
    });

    const [stripe, setStripe] = useState(initialStripe || {
        enabled: false,
        publishableKey: "",
        secretKey: "",
        webhookSecret: "",
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                updatePaymentSettings('payment_bkash', bkash),
                updatePaymentSettings('payment_paypal', paypal),
                updatePaymentSettings('payment_cryptomus', cryptomus),
                updatePaymentSettings('payment_stripe', stripe)
            ]);
            toast.success("Payment settings saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div 
            className="space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Payment Gateways</h2>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg">Configure secure payment methods for global donations</p>
                </div>
                 <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </motion.button>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Tabs defaultValue="bkash" className="w-full space-y-6 md:space-y-8">
                    <TabsList className="p-1 h-12 md:h-14 bg-secondary/30 backdrop-blur-md rounded-2xl border border-white/10 w-full max-w-xl mx-auto grid grid-cols-4">
                        <TabsTrigger 
                            value="bkash" 
                            className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all font-medium text-xs md:text-sm"
                        >
                            bKash
                        </TabsTrigger>
                        <TabsTrigger 
                            value="paypal" 
                            className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all font-medium text-xs md:text-sm"
                        >
                            PayPal
                        </TabsTrigger>
                        <TabsTrigger 
                            value="cryptomus" 
                            className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all font-medium text-xs md:text-sm"
                        >
                            Cryptomus
                        </TabsTrigger>
                         <TabsTrigger 
                            value="stripe" 
                            className="h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all font-medium text-xs md:text-sm"
                        >
                            Stripe
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* bKash Settings */}
                    <TabsContent value="bkash" className="focus-visible:outline-none">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                            <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                
                                <CardHeader className="pb-6 md:pb-8 border-b border-border/40 space-y-4 md:space-y-0">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 md:gap-5">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
                                                <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl md:text-2xl font-display">bKash Configuration</CardTitle>
                                                <CardDescription className="text-sm md:text-base">MFS integration for local payments</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50 w-full md:w-auto">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {bkash.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            <Switch 
                                                checked={bkash.enabled} 
                                                onCheckedChange={(checked) => setBkash({ ...bkash, enabled: checked })} 
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                                            <div className="space-y-1">
                                                <Label className="text-base font-semibold">Sandbox Mode</Label>
                                                <p className="text-sm text-muted-foreground">Enable for testing with bKash sandbox credentials</p>
                                            </div>
                                            <Switch 
                                                checked={bkash.isSandbox} 
                                                onCheckedChange={(checked) => setBkash({ ...bkash, isSandbox: checked })} 
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Username</Label>
                                                <Input 
                                                    placeholder="bKash PGW Username" 
                                                    value={bkash.username}
                                                    onChange={(e) => setBkash({ ...bkash, username: e.target.value })}
                                                    className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-pink-500/50 focus:ring-pink-500/20 font-mono text-sm md:text-base"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Password</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="bKash PGW Password" 
                                                    value={bkash.password}
                                                    onChange={(e) => setBkash({ ...bkash, password: e.target.value })}
                                                    className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-pink-500/50 focus:ring-pink-500/20 font-mono text-sm md:text-base"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">App Key</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="bKash App Key" 
                                                    value={bkash.appKey}
                                                    onChange={(e) => setBkash({ ...bkash, appKey: e.target.value })}
                                                    className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-pink-500/50 focus:ring-pink-500/20 font-mono text-sm md:text-base"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">App Secret</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="bKash App Secret" 
                                                    value={bkash.appSecret}
                                                    onChange={(e) => setBkash({ ...bkash, appSecret: e.target.value })}
                                                    className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-pink-500/50 focus:ring-pink-500/20 font-mono text-sm md:text-base"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* PayPal Settings */}
                    <TabsContent value="paypal" className="focus-visible:outline-none">
                         <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                            <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                
                                <CardHeader className="pb-6 md:pb-8 border-b border-border/40 space-y-4 md:space-y-0">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 md:gap-5">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                                                <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl md:text-2xl font-display">PayPal Configuration</CardTitle>
                                                <CardDescription className="text-sm md:text-base">Global payment gateway integration</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50 w-full md:w-auto">
                                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                                {paypal.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            <Switch 
                                                checked={paypal.enabled} 
                                                onCheckedChange={(checked) => setPaypal({ ...paypal, enabled: checked })} 
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Environment Mode</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaypal({...paypal, mode: 'sandbox'})}
                                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                    paypal.mode === 'sandbox' 
                                                    ? 'border-blue-500 bg-blue-500/5 shadow-inner' 
                                                    : 'border-border/50 hover:border-blue-500/50 hover:bg-secondary/50'
                                                }`}
                                            >
                                                <div className="font-semibold mb-1 text-sm md:text-base">Sandbox</div>
                                                <div className="text-xs md:text-sm text-muted-foreground">For testing and development</div>
                                                {paypal.mode === 'sandbox' && (
                                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaypal({...paypal, mode: 'live'})}
                                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                    paypal.mode === 'live' 
                                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-inner' 
                                                    : 'border-border/50 hover:border-emerald-500/50 hover:bg-secondary/50'
                                                }`}
                                            >
                                                <div className="font-semibold mb-1 text-sm md:text-base">Live Production</div>
                                                <div className="text-xs md:text-sm text-muted-foreground">Real transactions</div>
                                                {paypal.mode === 'live' && (
                                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Client ID</Label>
                                            <Input 
                                                placeholder="PayPal Client ID" 
                                                value={paypal.clientId}
                                                onChange={(e) => setPaypal({ ...paypal, clientId: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 font-mono text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Client Secret</Label>
                                            <Input 
                                                type="password"
                                                placeholder="PayPal Client Secret" 
                                                value={paypal.clientSecret}
                                                onChange={(e) => setPaypal({ ...paypal, clientSecret: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 font-mono text-sm md:text-base"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>
                    </TabsContent>

                    {/* Cryptomus Settings */}
                    <TabsContent value="cryptomus" className="focus-visible:outline-none">
                         <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                            <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                
                                <CardHeader className="pb-6 md:pb-8 border-b border-border/40 space-y-4 md:space-y-0">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 md:gap-5">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                                                <Wallet className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl md:text-2xl font-display">Cryptomus Configuration</CardTitle>
                                                <CardDescription className="text-sm md:text-base">Accept cryptocurrency payments securely</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50 w-full md:w-auto">
                                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                                {cryptomus.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            <Switch 
                                                checked={cryptomus.enabled} 
                                                onCheckedChange={(checked) => setCryptomus({ ...cryptomus, enabled: checked })} 
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8">
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Merchant ID</Label>
                                            <Input 
                                                placeholder="Cryptomus Merchant ID" 
                                                value={cryptomus.merchantId}
                                                onChange={(e) => setCryptomus({ ...cryptomus, merchantId: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-orange-500/50 focus:ring-orange-500/20 font-mono text-sm md:text-base"
                                            />
                                            <p className="text-xs md:text-sm text-muted-foreground">Found in your Cryptomus merchant settings.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Payment API Key</Label>
                                            <Input 
                                                type="password"
                                                placeholder="Payment API Key" 
                                                value={cryptomus.apiKey}
                                                onChange={(e) => setCryptomus({ ...cryptomus, apiKey: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-orange-500/50 focus:ring-orange-500/20 font-mono text-sm md:text-base"
                                            />
                                            <p className="text-xs md:text-sm text-muted-foreground">Required for creating invoices.</p>
                                        </div>
                                    </div>
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-orange-500">Security Note</h4>
                                            <p className="text-xs text-muted-foreground">Ensure you have verified your domain and enabled 2FA in your Cryptomus account before generating API keys.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>
                    </TabsContent>

                    {/* Stripe Settings */}
                    <TabsContent value="stripe" className="focus-visible:outline-none">
                         <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                            <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                
                                <CardHeader className="pb-6 md:pb-8 border-b border-border/40 space-y-4 md:space-y-0">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 md:gap-5">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
                                                <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl md:text-2xl font-display">Stripe Configuration</CardTitle>
                                                <CardDescription className="text-sm md:text-base">Accept credit cards and local payment methods</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50 w-full md:w-auto">
                                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                                {stripe.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            <Switch 
                                                checked={stripe.enabled} 
                                                onCheckedChange={(checked) => setStripe({ ...stripe, enabled: checked })} 
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8">
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Publishable Key</Label>
                                            <Input 
                                                placeholder="pk_test_..." 
                                                value={stripe.publishableKey}
                                                onChange={(e) => setStripe({ ...stripe, publishableKey: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20 font-mono text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Secret Key</Label>
                                            <Input 
                                                type="password"
                                                placeholder="sk_test_..." 
                                                value={stripe.secretKey}
                                                onChange={(e) => setStripe({ ...stripe, secretKey: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20 font-mono text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Webhook Secret</Label>
                                            <Input 
                                                type="password"
                                                placeholder="whsec_..." 
                                                value={stripe.webhookSecret}
                                                onChange={(e) => setStripe({ ...stripe, webhookSecret: e.target.value })}
                                                className="h-11 md:h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20 font-mono text-sm md:text-base"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
