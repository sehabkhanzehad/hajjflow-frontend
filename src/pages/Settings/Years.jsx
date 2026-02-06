import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, CalendarPlus, EllipsisVertical } from 'lucide-react'
import { useI18n } from "@/contexts/I18nContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function YearsSettings() {
    const { t, language } = useI18n()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingYear, setEditingYear] = useState(null)
    const [yearName, setYearName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const queryClient = useQueryClient()

    const { data: years, isLoading } = useQuery({
        queryKey: ['years'],
        queryFn: async () => {
            const response = await api.get('/years')
            return response.data
        },
    })

    const createMutation = useMutation({
        mutationFn: async (data) => await api.post('/years', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['years'] })
            toast.success(t('app.yearCreated'))
            setIsDialogOpen(false)
            setEditingYear(null)
            setYearName('')
            setStartDate('')
            setEndDate('')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.createFailed'))
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => await api.put(`/years/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['years'] })
            toast.success(t('app.yearUpdated'))
            setIsDialogOpen(false)
            setEditingYear(null)
            setYearName('')
            setStartDate('')
            setEndDate('')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.updateFailed'))
        },
    })

    const setDefaultMutation = useMutation({
        mutationFn: async (id) => await api.put(`/years/${id}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['years'] })
            toast.success("Default year updated successfully!")
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
            updateMutation.mutate({ id: editingYear.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (year) => {
        setEditingYear(year)
        setYearName(year.attributes.name || '')

        // Parse and format dates properly for input[type="date"]
        const formatDateForInput = (dateString) => {
            if (!dateString) return ''
            // Handle various date formats
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ''
            // Return in YYYY-MM-DD format
            return date.toISOString().split('T')[0]
        }

        setStartDate(formatDateForInput(year.attributes.startDate))
        setEndDate(formatDateForInput(year.attributes.endDate))
        setIsDialogOpen(true)
    }

    const handleOpenDialog = () => {
        setEditingYear(null)
        setYearName('')
        setStartDate('')
        setEndDate('')
        setIsDialogOpen(true)
    }

    const handleSetDefault = (year) => {
        setDefaultMutation.mutate(year.id)
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
                            <Button variant="outline" onClick={handleOpenDialog}>
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('app.yearName')}</TableHead>
                                    <TableHead>{t('app.startDate')}</TableHead>
                                    <TableHead>{t('app.endDate')}</TableHead>
                                    <TableHead>{t('app.default')}</TableHead>
                                    <TableHead className="text-right">{t('app.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {yearsList.map((year) => (
                                    <TableRow key={year.id}>
                                        <TableCell className="font-medium">
                                            {year.attributes.name}
                                        </TableCell>
                                        <TableCell>
                                            {year.attributes.startDate ? new Date(year.attributes.startDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {year.attributes.endDate ? new Date(year.attributes.endDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {year.attributes.default ? (
                                                <Badge variant="default">Yes</Badge>
                                            ) : (
                                                <Badge variant="secondary">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                        <EllipsisVertical size={15} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(year)}>
                                                        {t('app.edit')}
                                                    </DropdownMenuItem>
                                                    {!year.attributes.default && (
                                                        <DropdownMenuItem onClick={() => handleSetDefault(year)}>
                                                            {t('app.setAsDefault')}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}