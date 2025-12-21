import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean(),
});

const signIn = async (data) => {
    const response = await api.post("/auth/sign-in", data);
    return response.data;
};

export default function Home() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation();

    const mutation = useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            login(data.data.accessToken, data.data.user, formData.remember);
            navigate("/dashboard");
        },
        onError: (error) => {
            const message = error?.response?.data?.message || t('app.signInFailed');
            toast.error(message);
            setSubmitted(false);
        },
        onSettled: () => {
            setSubmitted(false);
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear field error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitted || mutation.isPending) return;
        setErrors({});
        setSubmitted(true);

        const result = signInSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach(err => {
                fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            setSubmitted(false);
            return;
        }

        mutation.mutate(formData);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">{t('app.title')}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t('app.welcome')}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            {t('app.email')}
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {t('app.password')}
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                    <div className="flex items-center">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                            {t('app.rememberMe')}
                        </label>
                    </div>
                    <Button type="submit" disabled={mutation.isPending || submitted} className="w-full">
                        {mutation.isPending ? t('app.signingIn') : t('app.signIn')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
