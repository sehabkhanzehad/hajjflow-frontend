import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { GroupLeaderTable } from './components/GroupLeaderTable'
import { GroupLeaderForm } from './components/GroupLeaderForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Users } from 'lucide-react'

export default function GroupLeaders() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingGroupLeader, setEditingGroupLeader] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [groupLeaderToDelete, setGroupLeaderToDelete] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        group_name: '',
        first_name: '',
        last_name: '',
        mother_name: '',
        father_name: '',
        phone: '',
        gender: '',
    })

    const { data, isLoading } = useQuery({
        queryKey: ['group-leaders', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/group-leaders', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const groupLeaders = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/group-leaders', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success('Group leader created successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create group leader')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success('Group leader updated successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update group leader')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setGroupLeaderToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success('Group leader deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete group leader')
        }
    })

    const handleSubmit = () => {
        if (editingGroupLeader) {
            updateMutation.mutate({
                id: editingGroupLeader.id,
                data: {
                    code: formData.code,
                    name: formData.first_name + ' ' + (formData.last_name || ''),
                    description: formData.description
                }
            })
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleEdit = (groupLeader) => {
        setEditingGroupLeader(groupLeader)
        setFormData({
            code: groupLeader.attributes.code,
            description: groupLeader.attributes.description || '',
            group_name: groupLeader.relationships?.groupLeader?.attributes?.groupName || '',
            first_name: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.firstName || '',
            last_name: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.lastName || '',
            mother_name: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.motherName || '',
            father_name: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.fatherName || '',
            phone: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.phone || '',
            gender: groupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.gender || '',
        })
        setDialogOpen(true)
    }

    const handleDelete = (groupLeader) => {
        setGroupLeaderToDelete(groupLeader)
        setOpenDeleteDialog(true)
    }

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            group_name: '',
            first_name: '',
            last_name: '',
            mother_name: '',
            father_name: '',
            phone: '',
            gender: '',
        })
        setEditingGroupLeader(null)
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
                    text: t('app.sidebar.options.groupLeaders'),
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title={t('app.sidebar.options.groupLeaders')} description="Manage your group leader sections." />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        Add Group Leader
                    </Button>
                </div>

                <div className="flex-1">
                    {groupLeaders?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title="No group leaders found"
                            description="Add group leader sections to manage your pilgrim groups effectively."
                            actionLabel="Add Group Leader"
                            onAction={openCreateDialog}
                            icon={<Users />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <GroupLeaderTable
                                    groupLeaders={groupLeaders}
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

            {/* create/edit group leader dialog */}
            <GroupLeaderForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingGroupLeader={editingGroupLeader}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                resetForm={resetForm}
            />

            {/* delete group leader alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={groupLeaderToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title="Delete group leader"
                description={`Are you sure you want to delete the group leader ${groupLeaderToDelete?.attributes?.name}?`}
            />
        </DashboardLayout>
    )
}