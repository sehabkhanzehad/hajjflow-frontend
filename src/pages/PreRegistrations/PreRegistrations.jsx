import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from '@/lib/api'
import { PreRegistrationTable } from './components/PreRegistrationTable'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText, Search, Filter, ArrowUpDown, Archive, XCircle, ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PreRegistrations() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [preRegistrationToDelete, setPreRegistrationToDelete] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'active')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useQuery({
        queryKey: ['pre-registrations', activeTab, currentPage, rowsPerPage, debouncedSearch],
        queryFn: async () => {
            let endpoint = '/pre-registrations';
            let params = {
                page: currentPage,
                per_page: rowsPerPage,
                search: debouncedSearch,
            };

            if (activeTab === 'cancelled') {
                endpoint = '/pre-registrations/archived';
                params.status = 'cancelled';
            } else if (activeTab === 'transferred') {
                endpoint = '/pre-registrations/archived';
                params.status = 'transferred';
            } else if (activeTab === 'archived') {
                endpoint = '/pre-registrations/archived';
                params.status = 'archived';
            }
            // activeTab === 'active' uses the default '/pre-registrations' endpoint

            const response = await api.get(endpoint, { params });
            return response.data;
        }
    })

    const preRegistrations = data?.data
    const meta = data?.meta

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/pre-registrations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pre-registrations'] })
            setOpenDeleteDialog(false)
            setPreRegistrationToDelete(null)
            toast.success("Pre-registration deleted successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete pre-registration")
        }
    })

    const handleDelete = (preRegistration) => {
        if (activeTab !== 'active') {
            toast.error("Cannot delete cancelled or transferred pre-registrations")
            return
        }
        setPreRegistrationToDelete(preRegistration)
        setOpenDeleteDialog(true)
    }

    const handleView = (preRegistration) => {

        // navigate(`/pilgrims/pre-registration/${preRegistration.id}`)
        navigate(`/pre-registrations/view/${preRegistration.id}`)
    }

    const openCreateDialog = () => {
        navigate('/pre-registrations/create')
    }

    const handleTabChange = (value) => {
        setActiveTab(value)
        setSearchParams({ tab: value })
        setCurrentPage(1) // Reset to first page when switching tabs
        setSearch('') // Clear search input
        setDebouncedSearch('') // Clear debounced search
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                    <PageHeading
                        title={t('app.pre-registrations.title') + ` (${meta?.total || 0})`}
                        description={t('app.pre-registrations.description')}
                    />
                    {activeTab === 'active' && (
                        <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('app.pre-registrations.add_new')}
                        </Button>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full h-auto p-1 flex overflow-x-auto sm:grid sm:grid-cols-4">
                        <TabsTrigger
                            value="active"
                            className="flex items-center gap-2 flex-shrink-0 sm:flex-1"
                            style={{
                                color: activeTab === 'active' ? '#16a34a' : '#16a34a',
                                backgroundColor: activeTab === 'active' ? '#f0fdf4' : 'transparent',
                                borderColor: activeTab === 'active' ? '#bbf7d0' : 'transparent'
                            }}
                        >
                            <FileText className="h-4 w-4" style={{ color: '#16a34a' }} />
                            <span className="font-medium hidden sm:inline" style={{ color: '#16a34a' }}>{t('app.pre-registrations.tabs.active')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="cancelled"
                            className="flex items-center gap-2 flex-shrink-0 sm:flex-1"
                            style={{
                                color: activeTab === 'cancelled' ? '#dc2626' : '#dc2626',
                                backgroundColor: activeTab === 'cancelled' ? '#fef2f2' : 'transparent',
                                borderColor: activeTab === 'cancelled' ? '#fecaca' : 'transparent'
                            }}
                        >
                            <XCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                            <span className="font-medium hidden sm:inline" style={{ color: '#dc2626' }}>{t('app.pre-registrations.tabs.cancelled')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="transferred"
                            className="flex items-center gap-2 flex-shrink-0 sm:flex-1"
                            style={{
                                color: activeTab === 'transferred' ? '#2563eb' : '#2563eb',
                                backgroundColor: activeTab === 'transferred' ? '#eff6ff' : 'transparent',
                                borderColor: activeTab === 'transferred' ? '#bfdbfe' : 'transparent'
                            }}
                        >
                            <ArrowRight className="h-4 w-4" style={{ color: '#2563eb' }} />
                            <span className="font-medium hidden sm:inline" style={{ color: '#2563eb' }}>{t('app.pre-registrations.tabs.transferred')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="archived"
                            className="flex items-center gap-2 flex-shrink-0 sm:flex-1"
                            style={{
                                color: activeTab === 'archived' ? '#ea580c' : '#ea580c',
                                backgroundColor: activeTab === 'archived' ? '#fff7ed' : 'transparent',
                                borderColor: activeTab === 'archived' ? '#fed7aa' : 'transparent'
                            }}
                        >
                            <Archive className="h-4 w-4" style={{ color: '#ea580c' }} />
                            <span className="font-medium hidden sm:inline" style={{ color: '#ea580c' }}>{t('app.pre-registrations.tabs.archived')}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by serial no, tracking no, full name, bangla name, phone, nid"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 max-w-lg"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <TableSkeletons />
                            ) : preRegistrations?.length > 0 ? (
                                <PreRegistrationTable
                                    preRegistrations={preRegistrations}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                    showActions={true}
                                />
                            ) : (
                                <EmptyComponent
                                    icon={<FileText />}
                                    title={t('app.pre-registrations.empty.title')}
                                    description={t('app.pre-registrations.empty.description')}
                                    action={
                                        <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            {t('app.pre-registrations.add_new')}
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="cancelled" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by serial no, tracking no, full name, bangla name, phone, nid"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 max-w-lg"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <TableSkeletons />
                            ) : preRegistrations?.length > 0 ? (
                                <PreRegistrationTable
                                    preRegistrations={preRegistrations}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                    showActions={true}
                                    showDelete={false}
                                />
                            ) : (
                                <EmptyComponent
                                    icon={<XCircle />}
                                    title={t('app.pre-registrations.cancelled.empty')}
                                    description={t('app.pre-registrations.cancelled.description')}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="transferred" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by serial no, tracking no, full name, bangla name, phone, nid"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 max-w-lg"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <TableSkeletons />
                            ) : preRegistrations?.length > 0 ? (
                                <PreRegistrationTable
                                    preRegistrations={preRegistrations}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                    showActions={true}
                                    showDelete={false}
                                />
                            ) : (
                                <EmptyComponent
                                    icon={<ArrowRight />}
                                    title={t('app.pre-registrations.transferred.empty')}
                                    description={t('app.pre-registrations.transferred.description')}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="archived" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by serial no, tracking no, full name, bangla name, phone, nid"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 max-w-lg"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <TableSkeletons />
                            ) : preRegistrations?.length > 0 ? (
                                <PreRegistrationTable
                                    preRegistrations={preRegistrations}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                    showActions={true}
                                    showDelete={false}
                                />
                            ) : (
                                <EmptyComponent
                                    icon={<Archive />}
                                    title={t('app.pre-registrations.archived.empty')}
                                    description={t('app.pre-registrations.archived.description')}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={preRegistrationToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title={t('app.pre-registrations.delete.title')}
                    description={t('app.pre-registrations.delete.description')}
                />
            </div>

            {meta && (
                <div className="mt-4">
                    <AppPagination
                        meta={meta}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            )}
        </DashboardLayout>
    )
}