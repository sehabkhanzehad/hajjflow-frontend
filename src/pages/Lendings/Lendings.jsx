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
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, CreditCard } from 'lucide-react'

export default function Lendings() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLending, setEditingLending] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [lendingToDelete, setLendingToDelete] = useState(null)

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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/loans/lendings/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lendings'] })
            toast.success(t('app.sectionUpdated', { section: 'Lending' }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToUpdateSection', { section: 'Lending' }))
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/loans/lendings/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setLendingToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['lendings'] })
            toast.success(t('app.sectionDeleted', { section: 'Lending' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.failedToDeleteSection', { section: 'Lending' }))
        }
    })

    const handleSubmit = (data) => {
        if (editingLending) {
            updateMutation.mutate({ id: editingLending.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (lending) => {
        setEditingLending(lending)
        setDialogOpen(true)
    }

    const handleDelete = (lending) => {
        setLendingToDelete(lending)
        setOpenDeleteDialog(true)
    }

    const resetForm = () => {
        setEditingLending(null)
    }

    const openCreateDialog = () => {
        resetForm()
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

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
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
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

            {/* create/edit lending dialog */}
            <LendingForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingLending={editingLending}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                users={users}
            />

            {/* delete lending alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={lendingToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title="Delete lending"
                description={`Are you sure you want to delete this lending record?`}
            />
        </DashboardLayout>
    )
}