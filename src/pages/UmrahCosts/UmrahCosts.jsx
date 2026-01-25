import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import PageHeading from '@/components/PageHeading'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppPagination from '@/components/app/AppPagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Plus, Receipt, Eye, Edit, EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'
import UmrahExpenseModal from './components/UmrahExpenseModal'

export default function UmrahCosts() {
    const { t } = useTranslation()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

    const { data: transactionsData, isLoading } = useQuery({
        queryKey: ['umrah-expenses', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/umrahs/expenses', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
            return response.data
        }
    })

    const transactions = transactionsData?.data || []
    const meta = transactionsData?.meta

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Umrah Costs"
                        description="Manage Umrah expense transactions"
                    />

                    <Button variant="outline"
                        size="sm"
                        onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : transactions.length === 0 ? (
                        <EmptyComponent
                            title="No Umrah expenses found"
                            description="Start by adding your first Umrah expense transaction."
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="h-10">
                                        <TableHead className="h-10 px-4">Date</TableHead>
                                        <TableHead className="h-10 px-4">Title</TableHead>
                                        <TableHead className="h-10 px-4">Voucher No</TableHead>
                                        <TableHead className="h-10 px-4">Type</TableHead>
                                        <TableHead>Before Balance</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>After Balance</TableHead>
                                        <TableHead className="h-10 px-4 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="h-12">
                                            <TableCell className="px-4 py-2">{new Date(transaction.attributes.date).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell className="px-4 py-2 font-medium">
                                                {transaction.attributes.title}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">{transaction.attributes.voucherNo || '-'}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${transaction.attributes.type === 'income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction.attributes.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{Number(transaction?.attributes?.beforeBalance || 0).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className={transaction?.attributes?.type === 'income' ? 'text-red-600' : 'text-green-600'}>
                                                    {transaction?.attributes?.type === 'income' ? '-' : '+'}
                                                    {Number(transaction?.attributes?.amount || 0).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{Number(transaction?.attributes?.afterBalance || 0).toFixed(2)}</TableCell>
                                            <TableCell className="px-4 py-2 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                            <EllipsisVertical size={15} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => toast.info('View feature coming soon')}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {meta && (
                    <AppPagination
                        meta={meta}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>

            <UmrahExpenseModal
                open={isExpenseModalOpen}
                onOpenChange={setIsExpenseModalOpen}
            />
        </DashboardLayout>
    )
}