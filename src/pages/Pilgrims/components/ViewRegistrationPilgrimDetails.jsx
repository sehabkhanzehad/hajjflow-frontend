import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    User,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    FileText,
    Users,
    Package,
    MapPin,
    IdCard,
    Clock,
    EllipsisVertical,
    Eye,
    Receipt
} from 'lucide-react'
import api from '@/lib/api'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PilgrimProfileCard } from '@/components/PilgrimProfileCard'

export function ViewRegistrationPilgrimDetails({ pilgrimData, pilgrimType, meta }) {
    const queryClient = useQueryClient()
    const { t, language } = useI18n()

    // Transaction details modal
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState(null)

    // Transaction pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)

    const pilgrim = pilgrimData
    const id = pilgrim?.id

    // Fetch transactions
    const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['registration-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/registrations/${id}/transactions`, {
                params: { page: currentPage, per_page: rowsPerPage }
            })
            return response.data
        },
        enabled: !!id
    })

    const transactions = transactionsData?.data || []
    const transactionsMeta = transactionsData?.meta

    const user = pilgrim.pilgrim?.user || pilgrim.user
    const groupLeader = pilgrim.pre_registration?.group_leader
    const packageData = pilgrim.package
    const bank = pilgrim.bank
    const passports = pilgrim.passports || []
    const presentAddress = user?.present_address
    const permanentAddress = user?.permanent_address

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'R'
    }

    const getAvatarColor = (name) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
            'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
            'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
            'bg-rose-500',
        ]
        const str = name || 'default'
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    if (!pilgrim) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t({ en: 'Pilgrim data not available', bn: 'পিলগ্রিম ডেটা উপলব্ধ নেই' })}
                    </h2>
                    <p className="text-gray-600">
                        {t({ en: 'Unable to load pilgrim information.', bn: 'পিলগ্রিম তথ্য লোড করতে অসমর্থ।' })}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <PilgrimProfileCard
                pilgrim={pilgrim}
                pilgrimType={pilgrimType}
                user={user}
                groupLeader={groupLeader}
                packageData={packageData}
                passport={passports?.[0]}
                status={null}
                statusColors={{}}
                financialData={null}
                onPassportView={null}
            />

            {/* Pilgrim Information Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="personal">
                        {t({ en: 'Personal Info', bn: 'ব্যক্তিগত তথ্য' })}
                    </TabsTrigger>
                    <TabsTrigger value="package">
                        {t({ en: 'Package', bn: 'প্যাকেজ' })}
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                        {t({ en: 'Documents', bn: 'ডকুমেন্টস' })}
                    </TabsTrigger>
                    <TabsTrigger value="bank">
                        {t({ en: 'Bank Info', bn: 'ব্যাংক তথ্য' })}
                    </TabsTrigger>
                    <TabsTrigger value="transactions">
                        {t({ en: 'Transactions', bn: 'লেনদেন' })}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {t({ en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Full Name', bn: 'পুরো নাম' })}
                                        </Label>
                                        <p className="text-sm">{user?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Email', bn: 'ইমেইল' })}
                                        </Label>
                                        <p className="text-sm">{user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Phone', bn: 'ফোন' })}
                                        </Label>
                                        <p className="text-sm">{user?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Date of Birth', bn: 'জন্ম তারিখ' })}
                                        </Label>
                                        <p className="text-sm">{user?.date_of_birth || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Gender', bn: 'লিঙ্গ' })}
                                        </Label>
                                        <p className="text-sm">{user?.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Marital Status', bn: 'বৈবাহিক অবস্থা' })}
                                        </Label>
                                        <p className="text-sm">{user?.marital_status || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Group Leader */}
                        {groupLeader && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        {t({ en: 'Group Leader', bn: 'গ্রুপ লিডার' })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={groupLeader.avatar} alt={groupLeader.name} />
                                            <AvatarFallback className={getAvatarColor(groupLeader.name)}>
                                                {getInitials(groupLeader.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium">{groupLeader.name}</h4>
                                            <p className="text-sm text-gray-600">{groupLeader.email}</p>
                                            <p className="text-sm text-gray-600">{groupLeader.phone}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Addresses */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {t({ en: 'Addresses', bn: 'ঠিকানা' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {presentAddress && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            {t({ en: 'Present Address', bn: 'বর্তমান ঠিকানা' })}
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>{presentAddress.street_address}</p>
                                            <p>{presentAddress.city}, {presentAddress.state} {presentAddress.postal_code}</p>
                                            <p>{presentAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                {permanentAddress && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            {t({ en: 'Permanent Address', bn: 'স্থায়ী ঠিকানা' })}
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>{permanentAddress.street_address}</p>
                                            <p>{permanentAddress.city}, {permanentAddress.state} {permanentAddress.postal_code}</p>
                                            <p>{permanentAddress.country}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="package" className="space-y-6">
                    {packageData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {t({ en: 'Hajj Package', bn: 'হজ প্যাকেজ' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Package Name', bn: 'প্যাকেজ নাম' })}
                                        </Label>
                                        <p className="text-sm">{packageData.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Package Type', bn: 'প্যাকেজ টাইপ' })}
                                        </Label>
                                        <p className="text-sm">{packageData.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Price', bn: 'মূল্য' })}
                                        </Label>
                                        <p className="text-sm">৳{packageData.price}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Duration', bn: 'সময়কাল' })}
                                        </Label>
                                        <p className="text-sm">{packageData.duration} days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IdCard className="h-5 w-5" />
                                {t({ en: 'Passports', bn: 'পাসপোর্ট' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {passports.length > 0 ? (
                                <div className="space-y-4">
                                    {passports.map((passport) => (
                                        <div key={passport.id} className="border rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t({ en: 'Passport Number', bn: 'পাসপোর্ট নম্বর' })}
                                                    </Label>
                                                    <p className="text-sm">{passport.passport_number}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t({ en: 'Issue Date', bn: 'ইস্যু তারিখ' })}
                                                    </Label>
                                                    <p className="text-sm">{passport.issue_date}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t({ en: 'Expiry Date', bn: 'মেয়াদ উত্তীর্ণের তারিখ' })}
                                                    </Label>
                                                    <p className="text-sm">{passport.expiry_date}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t({ en: 'Issuing Country', bn: 'ইস্যুকারী দেশ' })}
                                                    </Label>
                                                    <p className="text-sm">{passport.issuing_country}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        {t({ en: 'Status', bn: 'স্ট্যাটাস' })}
                                                    </Label>
                                                    <Badge variant={passport.status === 'active' ? 'default' : 'secondary'}>
                                                        {passport.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <IdCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">
                                        {t({ en: 'No passports found', bn: 'কোন পাসপোর্ট পাওয়া যায়নি' })}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bank" className="space-y-6">
                    {bank && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {t({ en: 'Bank Information', bn: 'ব্যাংক তথ্য' })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Bank Name', bn: 'ব্যাংক নাম' })}
                                        </Label>
                                        <p className="text-sm">{bank.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Account Number', bn: 'অ্যাকাউন্ট নম্বর' })}
                                        </Label>
                                        <p className="text-sm">{bank.account_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Account Holder', bn: 'অ্যাকাউন্ট হোল্ডার' })}
                                        </Label>
                                        <p className="text-sm">{bank.account_holder_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            {t({ en: 'Branch', bn: 'ব্রাঞ্চ' })}
                                        </Label>
                                        <p className="text-sm">{bank.branch_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                {t({ en: 'Transaction History', bn: 'লেনদেনের ইতিহাস' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isTransactionsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t({ en: 'Date', bn: 'তারিখ' })}</TableHead>
                                                <TableHead>{t({ en: 'Type', bn: 'টাইপ' })}</TableHead>
                                                <TableHead>{t({ en: 'Amount', bn: 'পরিমাণ' })}</TableHead>
                                                <TableHead>{t({ en: 'Status', bn: 'স্ট্যাটাস' })}</TableHead>
                                                <TableHead className="text-right">{t({ en: 'Actions', bn: 'ক্রিয়া' })}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>{transaction.type}</TableCell>
                                                    <TableCell>৳{transaction.amount}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                                                            {transaction.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedTransaction(transaction)
                                                                setShowTransactionModal(true)
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {transactionsMeta && (
                                        <AppPagination
                                            currentPage={currentPage}
                                            totalPages={transactionsMeta.last_page}
                                            onPageChange={setCurrentPage}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">
                                        {t({ en: 'No transactions found', bn: 'কোন লেনদেন পাওয়া যায়নি' })}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Transaction Details Modal */}
            {showTransactionModal && selectedTransaction && (
                <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t({ en: 'Transaction Details', bn: 'লেনদেনের বিস্তারিত' })}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">{t({ en: 'Date', bn: 'তারিখ' })}</Label>
                                    <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">{t({ en: 'Type', bn: 'টাইপ' })}</Label>
                                    <p>{selectedTransaction.type}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">{t({ en: 'Amount', bn: 'পরিমাণ' })}</Label>
                                    <p>৳{selectedTransaction.amount}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">{t({ en: 'Status', bn: 'স্ট্যাটাস' })}</Label>
                                    <Badge variant={selectedTransaction.status === 'completed' ? 'default' : 'secondary'}>
                                        {selectedTransaction.status}
                                    </Badge>
                                </div>
                            </div>
                            {selectedTransaction.description && (
                                <div>
                                    <Label className="text-sm font-medium">{t({ en: 'Description', bn: 'বিবরণ' })}</Label>
                                    <p>{selectedTransaction.description}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}