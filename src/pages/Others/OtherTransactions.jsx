import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { EllipsisVertical, Eye, X, FileText } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function OtherTransactions() {
    const { t } = useTranslation()
    const { id } = useParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['other-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/sections/others/${id}/transactions`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
            return response.data
        }
    })

    const { data: otherData } = useQuery({
        queryKey: ['other-details', id],
        queryFn: async () => {
            const response = await api.get(`/sections/others/${id}`)
            return response.data
        }
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <TableSkeletons />
            </DashboardLayout>
        )
    }

    const transactions = data?.data || []
    const meta = data?.meta

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction)
        setIsDialogOpen(true)
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                {
                    type: 'link',
                    text: t('app.home'),
                    href: '/',
                },
                {
                    type: 'link',
                    text: t('app.sidebar.options.others'),
                    href: '/sections/others',
                },
                {
                    type: 'page',
                    text: 'Transactions',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <PageHeading
                    title="Other Transactions"
                    description="View and manage other transactions"
                />

                <div className="flex-1">
                    {/* Other Details Section */}
                    {otherData && (
                        <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-0.5">
                                            <span className="text-sm font-medium text-foreground">
                                                {otherData.data.attributes.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Code: {otherData.data.attributes.code}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <EmptyComponent
                            title="No transactions found"
                            description="This other section doesn't have any transactions yet."
                            icon={<FileText className="h-12 w-12" />}
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Voucher No</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions?.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{transaction?.attributes?.date ? new Date(transaction.attributes.date).toLocaleDateString('en-GB') : 'N/A'}</TableCell>
                                            <TableCell>{transaction?.attributes?.title || 'N/A'}</TableCell>
                                            <TableCell>{transaction?.attributes?.voucherNo || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={transaction?.attributes?.type === 'income' ? 'default' : 'destructive'}>
                                                    {transaction?.attributes?.type === 'income' ? 'Deposit' : 'Expense'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ৳{Number(transaction?.attributes?.amount || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                            <EllipsisVertical size={15} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
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

                <AppPagination
                    meta={meta}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                {/* Transaction Details Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                            <DialogClose asChild>
                                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </DialogClose>
                        </DialogHeader>

                        {selectedTransaction && otherData && (
                            <div className="space-y-4">
                                {/* Transaction Type */}
                                <div className="flex justify-center">
                                    <Badge variant={selectedTransaction?.attributes?.type === 'income' ? 'default' : 'destructive'}>
                                        {selectedTransaction?.attributes?.type === 'income' ? 'Deposit' : 'Expense'}
                                    </Badge>
                                </div>

                                <Separator />

                                {/* Other Info */}
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Other</p>
                                        <p className="text-sm font-medium">
                                            {otherData.data.attributes.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Code: {otherData.data.attributes.code}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Transaction Details */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Transaction</h4>
                                    <p className="text-sm font-medium">
                                        {selectedTransaction?.attributes?.title || 'N/A'}
                                    </p>
                                    {selectedTransaction?.attributes?.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedTransaction.attributes.description}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                {/* Transaction Meta */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="text-sm font-medium">
                                            {selectedTransaction?.attributes?.date
                                                ? new Date(selectedTransaction.attributes.date).toLocaleDateString('en-GB')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Voucher No</p>
                                        <p className="text-sm font-medium">
                                            {selectedTransaction?.attributes?.voucherNo || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="text-sm font-medium">
                                            ৳{Number(selectedTransaction?.attributes?.amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Balance</p>
                                        <p className="text-sm font-medium">
                                            ৳{Number(selectedTransaction?.attributes?.afterBalance || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}