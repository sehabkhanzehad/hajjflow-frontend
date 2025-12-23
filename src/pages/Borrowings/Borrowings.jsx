import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { BorrowingTable } from './components/BorrowingTable'
import { BorrowingForm } from './components/BorrowingForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, CreditCard } from 'lucide-react'

export default function Borrowings() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBorrowing, setEditingBorrowing] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [borrowingToDelete, setBorrowingToDelete] = useState(null)

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users')
            return response.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['borrowings', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/loans/borrowings', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const borrowings = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/loans/borrowings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrowings'] })
            toast.success(t('app.sectionCreated', { section: 'Borrowing' }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToCreateSection', { section: 'Borrowing' }))
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/loans/borrowings/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrowings'] })
            toast.success(t('app.sectionUpdated', { section: 'Borrowing' }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToUpdateSection', { section: 'Borrowing' }))
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/loans/borrowings/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setBorrowingToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['borrowings'] })
            toast.success(t('app.sectionDeleted', { section: 'Borrowing' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.failedToDeleteSection', { section: 'Borrowing' }))
        }
    })

    const handleSubmit = (data) => {
        if (editingBorrowing) {
            updateMutation.mutate({ id: editingBorrowing.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (borrowing) => {
        setEditingBorrowing(borrowing)
        setDialogOpen(true)
    }

    const handleDelete = (borrowing) => {
        setBorrowingToDelete(borrowing)
        setOpenDeleteDialog(true)
    }

    const resetForm = () => {
        setEditingBorrowing(null)
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
                    text: 'Borrowings',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title="Borrowings" description="Manage borrowing records" />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        Add Borrowing
                    </Button>
                </div>

                <div className="flex-1">
                    {borrowings?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title="No borrowings found"
                            description="Add borrowing records to track your loans."
                            actionLabel="Add Borrowing"
                            onAction={openCreateDialog}
                            icon={<CreditCard />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <BorrowingTable
                                    borrowings={borrowings}
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

            {/* create/edit borrowing dialog */}
            <BorrowingForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingBorrowing={editingBorrowing}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                users={users}
            />

            {/* delete borrowing alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={borrowingToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title="Delete borrowing"
                description={`Are you sure you want to delete this borrowing record?`}
            />
        </DashboardLayout>
    )
}