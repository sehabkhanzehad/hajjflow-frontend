import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useState } from 'react'

export default function AccountSettings() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) => {
            const response = await axios.put('/api/user', data)
            return response.data
        },
        onSuccess: (data) => {
            // Update user in context and storage
            const updatedUser = { ...user, ...data.user }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            queryClient.invalidateQueries()
            toast.success(t('app.accountUpdated'))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.updateFailed'))
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate({ name, email })
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('app.profile')}</CardTitle>
                <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('app.name')}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('app.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
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