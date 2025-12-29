import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ui/image-upload"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const accountSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(255, 'First name must be less than 255 characters'),
    lastName: z.string().max(255, 'Last name must be less than 255 characters').optional(),
    email: z.string().email('Invalid email address'),
})

export default function AccountSettings() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { data: userData, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            console.log('Fetching user data...');
            const response = await api.get('/user')
            console.log('User data response:', response.data);
            return response.data.data ? response.data.data.attributes : response.data.attributes
        },
    })

    const [avatar, setAvatar] = useState(null)

    const form = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            email: userData?.email || '',
        },
        mode: 'onSubmit', // Only validate on form submission
    })

    const { register, handleSubmit, formState: { errors }, setValue, reset } = form

    useEffect(() => {
        if (userData) {
            console.log('Resetting form with userData:', userData);
            reset({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
            })
        }
    }, [userData, reset])

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('email', data.email)
            if (data.avatar) {
                formData.append('avatar', data.avatar)
            }
            const response = await api.put('/user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        },
        onSuccess: (data) => {
            const updatedUser = { ...userData, ...data.data.user.attributes }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            queryClient.setQueryData(['user'], updatedUser)
            toast.success(t('app.accountUpdated'))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.updateFailed'))
        },
    })

    const onSubmit = (data) => {
        const fullName = `${data.firstName} ${data.lastName || ''}`.trim()
        mutate({ name: fullName, email: data.email, avatar })
    }

    if (error) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('app.profile')}</CardTitle>
                    <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">
                        Error loading user data: {error.message}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('app.profile')}</CardTitle>
                    <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-4 animate-pulse">
                            <div className="h-20 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('app.profile')}</CardTitle>
                <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <Label>Avatar</Label>
                            <ImageUpload
                                value={userData?.avatar}
                                onChange={(file) => setAvatar(file)}
                                onRemove={() => setAvatar(null)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...register('firstName')}
                                />
                                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...register('lastName')}
                                />
                                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('app.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? t('app.signingIn') : t('app.updateAccount')}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}