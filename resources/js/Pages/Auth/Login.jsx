import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Head title="Sign in" />

            {/* Left Side - Form */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
                    {/* Logo/Branding */}
                    <div className="mb-4 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <LogIn className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-medium">Cluster Admin</h1>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-2">
                    {/* Status Message */}
                    {status && (
                        <Alert className="mb-4">
                            <AlertDescription>{status}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form Header */}
                    <div className="flex flex-col space-y-2 text-start">
                        <h2 className="text-lg font-semibold tracking-tight">Sign in</h2>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and password below to log into your account. Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="text-nowrap underline underline-offset-4 hover:text-primary"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="name@example.com"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-muted-foreground hover:text-primary"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked)}
                            />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" className="mt-2" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogIn className="mr-2 h-4 w-4" />
                            )}
                            Sign in
                        </Button>
                    </form>

                    {/* Terms and Privacy */}
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking sign in, you agree to our{' '}
                        <a
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>

            {/* Right Side - Dashboard Image */}
            <div
                className={cn(
                    'relative h-full overflow-hidden bg-muted max-lg:hidden',
                    'flex items-center justify-center'
                )}
            >
                <div className="text-center p-8">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <LogIn className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Sign in to access your dashboard and manage your projects, files, and integrations.
                    </p>
                    <div className="grid gap-4 text-left max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <LogIn className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Secure Authentication</p>
                                <p className="text-sm text-muted-foreground">Enterprise-grade security for your account</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <LogIn className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Project Management</p>
                                <p className="text-sm text-muted-foreground">Organize and track your projects efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <LogIn className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">App Integrations</p>
                                <p className="text-sm text-muted-foreground">Connect with Google Drive, Gmail, and more</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
