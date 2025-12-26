import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { EmptyComponent } from '@/components/app/EmptyComponent'
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
import { EllipsisVertical, Eye } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'

export default function LoanTransactions() {
    const { id } = useParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['loan-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/sections/loans/lendings/${id}/transactions`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
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

    // Calculate running balance (process from oldest to newest)
    const transactionsWithBalance = [...transactions].reverse().reduce((acc, transaction, index) => {
        const amount = Number(transaction?.attributes?.amount) || 0
        const type = transaction?.attributes?.type
        const previousBalance = index > 0 ? acc[index - 1].balance : 0

        let currentBalance = previousBalance
        if (type === 'expense') {
            currentBalance += amount
        } else if (type === 'income') {
            currentBalance -= amount
        }

        acc.push({
            ...transaction,
            balance: currentBalance
        })

        return acc
    }, []).reverse() || [] // Reverse back to original order for display

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex-1">
                    {transactions.length === 0 ? (
                        <EmptyComponent
                            title="No transactions found"
                            description="This loan doesn't have any transactions yet."
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionsWithBalance?.map((transaction, index) => (
                                        <TableRow key={transaction?.id || `transaction-${index}`}>
                                            <TableCell>{transaction?.attributes?.date ? new Date(transaction.attributes.date).toLocaleDateString('en-GB') : 'N/A'}</TableCell>
                                            <TableCell className="font-medium max-w-xs truncate" title={transaction?.attributes?.title || 'N/A'}>
                                                {transaction?.attributes?.title || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    transaction?.attributes?.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction?.attributes?.type ? (transaction.attributes.type.charAt(0).toUpperCase() + transaction.attributes.type.slice(1)) : 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{Number(transaction?.attributes?.amount) || 0}</TableCell>
                                            <TableCell className={`font-medium ${
                                                (transaction?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {Number(transaction?.balance || 0).toFixed(2)}
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
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) || []}
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

                {/* Transaction Details Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl">
                        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                                    <img src="/logo.png" alt="M/S Raj Travels" className="w-10 h-10 object-contain" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900">M/S RAJ TRAVELS</DialogTitle>
                                    <p className="text-sm text-gray-600">189/1, Nayagla, Chapainawabganj</p>
                                </div>
                            </div>
                            <DialogClose className="rounded-full w-8 h-8 bg-white shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors">
                                <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </DialogClose>
                        </DialogHeader>

                        <div className="p-4 space-y-3">
                            {selectedTransaction && (
                                <>
                                    {/* Receipt Type Badge */}
                                    <div className="text-center -mt-2">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                            selectedTransaction?.attributes?.type === 'income'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedTransaction?.attributes?.type === 'income' ? 'Income Receipt' : 'Expense Receipt'}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex justify-end -mt-1">
                                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Date:</span> {
                                                    selectedTransaction?.attributes?.date
                                                        ? new Date(selectedTransaction.attributes.date).toLocaleDateString('en-GB')
                                                        : 'N/A'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 leading-tight">
                                                {selectedTransaction?.attributes?.title || 'N/A'}
                                            </h3>
                                            {selectedTransaction?.attributes?.description && (
                                                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                                                    {selectedTransaction.attributes.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount Section */}
                                    <div className={`rounded-lg p-4 border-2 ${
                                        selectedTransaction?.attributes?.type === 'income'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-0.5">Transaction Amount</p>
                                                <p className={`text-xs font-semibold ${
                                                    selectedTransaction?.attributes?.type === 'income' ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    {selectedTransaction?.attributes?.type === 'income' ? 'Credit' : 'Debit'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${
                                                    selectedTransaction?.attributes?.type === 'income' ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    ৳{Number(selectedTransaction?.attributes?.amount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center pt-3 border-t border-gray-200 -mb-1">
                                        <p className="text-xs text-gray-500">
                                            Generated on {new Date().toLocaleDateString('en-GB')} • M/S Raj Travels
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}