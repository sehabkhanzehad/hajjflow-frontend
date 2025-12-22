import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, CalendarPlus } from 'lucide-react'

export default function YearsSettings() {
    const { t } = useTranslation()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingYear, setEditingYear] = useState(null)
    const [yearName, setYearName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [status, setStatus] = useState(true)
    const queryClient = useQueryClient()

    const { data: years, isLoading } = useQuery({
        queryKey: ['years'],
        queryFn: async () => {
            const response = await axios.get('/api/years')
            return response.data
        },
    })

    const createMutation = useMutation({
        mutationFn: async (data) => await axios.post('/api/years', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['years'] })
            toast.success(t('app.yearCreated'))
            setIsDialogOpen(false)
            setEditingYear(null)
            setYearName('')
            setStartDate('')
            setEndDate('')
            setStatus(true)
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.createFailed'))
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => await axios.put(`/api/years/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['years'] })
            toast.success(t('app.yearUpdated'))
            setIsDialogOpen(false)
            setEditingYear(null)
            setYearName('')
            setStartDate('')
            setEndDate('')
            setStatus(true)
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.updateFailed'))
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!yearName.trim()) {
            toast.error(t('app.yearNameRequired'))
            return
        }
        if (!startDate) {
            toast.error(t('app.startDateRequired'))
            return
        }
        if (!endDate) {
            toast.error(t('app.endDateRequired'))
            return
        }

        const data = {
            name: yearName,
            start_date: startDate,
            end_date: endDate,
        }

        if (editingYear) {
            updateMutation.mutate({ id: editingYear.id, data: { ...data, status } })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (year) => {
        setEditingYear(year)
        setYearName(year.name)
        setStartDate(year.start_date)
        setEndDate(year.end_date)
        setStatus(year.status)
        setIsDialogOpen(true)
    }

    const handleOpenDialog = () => {
        setEditingYear(null)
        setYearName('')
        setStartDate('')
        setEndDate('')
        setStatus(true)
        setIsDialogOpen(true)
    }

    if (isLoading) return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('app.yearsManagement')}</CardTitle>
                <CardDescription>{t('app.manageYears')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center py-12">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
            </CardContent>
        </Card>
    )

    const yearsList = years?.data || []

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{t('app.yearsManagement')}</CardTitle>
                        <CardDescription>{t('app.manageYears')}</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) {
                            setEditingYear(null)
                            setYearName('')
                            setStartDate('')
                            setEndDate('')
                            setStatus(true)
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenDialog}>
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                {t('app.addYear')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingYear ? t('app.editYear') : t('app.addYear')}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="yearName">
                                        {t('app.yearName')}
                                    </Label>
                                    <Input
                                        id="yearName"
                                        value={yearName}
                                        onChange={(e) => setYearName(e.target.value)}
                                        placeholder={t('app.enterYearName')}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">
                                        {t('app.startDate')}
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">
                                        {t('app.endDate')}
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                                {editingYear && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="status"
                                            type="checkbox"
                                            checked={status}
                                            onChange={(e) => setStatus(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="status" className="cursor-pointer">
                                            {t('app.active')}
                                        </Label>
                                    </div>
                                )}
                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        {t('app.cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {createMutation.isPending || updateMutation.isPending ? t('app.saving') : t('app.save')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {yearsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t('app.noYears')}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('app.noYearsDescription')}
                        </p>
                        <Button onClick={handleOpenDialog} variant="outline">
                            <CalendarPlus className="w-4 h-4 mr-2" />
                            {t('app.addYourFirstYear')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {yearsList.map((year) => (
                            <div key={year.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="shrink-0">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{year.name}</p>
                                        {year.created_at && (
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(year.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(year)}
                                >
                                    {t('app.edit')}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}