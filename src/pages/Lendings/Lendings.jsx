import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { LendingTable } from './components/LendingTable'
import { LendingForm } from './components/LendingForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, CreditCard } from 'lucide-react'

export default function Lendings() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users')
            return response.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['lendings', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/loans/lendings', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const lendings = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/loans/lendings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lendings'] })
            toast.success(t('app.sectionCreated', { section: 'Lending' }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToCreateSection', { section: 'Lending' }))
        }
    })

    const handleSubmit = (data) => {
        createMutation.mutate(data)
    }

    const resetForm = () => {
        // No need to reset editingLending anymore
    }

    const openCreateDialog = () => {
        resetForm()
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending

    return (
        <DashboardLayout
            breadcrumbs={[
                {
                    type: 'link',
                    text: t('app.home'),
                    href: '/',
                },
                {
                    type: 'page',
                    text: 'Lendings',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title="Lendings" description="Manage lending records" />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        Add Lending
                    </Button>
                </div>

                <div className="flex-1">
                    {lendings?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title="No lendings found"
                            description="Add lending records to track your loans."
                            actionLabel="Add Lending"
                            onAction={openCreateDialog}
                            icon={<CreditCard />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <LendingTable
                                    lendings={lendings}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* pagination */}
                <AppPagination
                    meta={meta}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>

            {/* create lending dialog */}
            <LendingForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                users={users}
            />
        </DashboardLayout>
    )
}