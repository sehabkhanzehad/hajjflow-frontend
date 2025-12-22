import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { BillTable } from './components/BillTable'
import { BillForm } from './components/BillForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Receipt } from 'lucide-react'

export default function Bills() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBill, setEditingBill] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [billToDelete, setBillToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['bills', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/bills', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const bills = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/bills', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] })
            toast.success('Bill created successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create bill')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/bills/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] })
            toast.success('Bill updated successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update bill')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setBillToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['bills'] })
            toast.success('Bill deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete bill')
        }
    })

    const handleSubmit = (formData, editingBill) => {
        if (editingBill) {
            updateMutation.mutate({
                id: editingBill.id,
                data: formData
            })
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleEdit = (bill) => {
        setEditingBill(bill)
        setDialogOpen(true)
    }

    const handleDelete = (bill) => {
        setBillToDelete(bill)
        setOpenDeleteDialog(true)
    }

    const resetForm = () => {
        setEditingBill(null)
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
                    text: t('app.sidebar.options.bills'),
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title={t('app.sidebar.options.bills')} description="Manage your bill sections." />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        Add Bill
                    </Button>
                </div>

                <div className="flex-1">
                    {bills?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title="No bills found"
                            description="Add bill sections to manage your billing information effectively."
                            actionLabel="Add Bill"
                            onAction={openCreateDialog}
                            icon={<Receipt />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <BillTable
                                    bills={bills}
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

            {/* create/edit bill dialog */}
            <BillForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingBill={editingBill}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* delete bill alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={billToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title="Delete bill"
                description={`Are you sure you want to delete the bill ${billToDelete?.attributes?.name}?`}
            />
        </DashboardLayout>
    )
}