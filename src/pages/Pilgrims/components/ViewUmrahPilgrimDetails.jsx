import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PassportModal } from '../../UmrahPilgrims/components/PassportModal'
import { EditPersonalInfoModal } from '../../UmrahPilgrims/components/EditPersonalInfoModal'
import { EditContactInfoModal } from '../../UmrahPilgrims/components/EditContactInfoModal'
import { EditAvatarModal } from '../../UmrahPilgrims/components/EditAvatarModal'
import { EditAddressModal } from '../../UmrahPilgrims/components/EditAddressModal'
import { toast } from 'sonner'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
    DialogFooter,
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
    Heart,
    Clock,
    Image,
    Edit,
    Plus,
    Check,
    XCircle,
    RotateCw,
    EllipsisVertical,
    Eye,
    Printer,
    Receipt,
    Percent
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

export function ViewUmrahPilgrimDetails({ pilgrimData, pilgrimType, meta }) {
    const queryClient = useQueryClient()
    const { t, language } = useI18n()

    // Modal states
    const [showPassportDialog, setShowPassportDialog] = useState(false)
    const [showPassportModal, setShowPassportModal] = useState(false)
    const [editingPassport, setEditingPassport] = useState(null)
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false)
    const [showContactInfoModal, setShowContactInfoModal] = useState(false)
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false)

    // Status action dialogs
    const [showConfirmCancel, setShowConfirmCancel] = useState(false)
    const [showConfirmComplete, setShowConfirmComplete] = useState(false)
    const [showConfirmRestore, setShowConfirmRestore] = useState(false)
    const [showDiscountModal, setShowDiscountModal] = useState(false)

    // Transaction details modal
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState(null)

    // Transaction pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [discountAmount, setDiscountAmount] = useState('')

    // Timestamp for cache busting
    const [passportTimestamp, setPassportTimestamp] = useState(0)

    const pilgrim = pilgrimData
    const id = pilgrim?.id

    const handleOpenPassportDialog = () => {
        setPassportTimestamp(Date.now())
        setShowPassportDialog(true)
    }

    // Mutations
    const addPassportMutation = useMutation({
        mutationFn: (formData) => api.post(`/umrahs/${id}/passport`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowPassportModal(false)
            setEditingPassport(null)
            toast.success(t({ en: 'Passport added successfully', bn: 'পাসপোর্ট সফলভাবে অ্যাড করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to add passport', bn: 'পাসপোর্ট অ্যাড করতে ব্যর্থ' }))
        }
    })

    const updatePassportMutation = useMutation({
        mutationFn: (formData) => {
            const passportId = pilgrim?.passports?.[0]?.id
            return api.post(`/umrahs/passport/${passportId}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowPassportModal(false)
            setEditingPassport(null)
            toast.success(t({ en: 'Passport updated successfully', bn: 'পাসপোর্ট সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update passport', bn: 'পাসপোর্ট আপডেট করতে ব্যর্থ' }))
        }
    })

    const updatePersonalInfoMutation = useMutation({
        mutationFn: (data) => api.put(`/umrahs/${id}/pilgrim/personal-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowPersonalInfoModal(false)
            toast.success(t({ en: 'Personal information updated successfully', bn: 'ব্যক্তিগত তথ্য সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update personal information', bn: 'ব্যক্তিগত তথ্য আপডেট করতে ব্যর্থ' }))
        }
    })

    const updateContactInfoMutation = useMutation({
        mutationFn: (data) => api.put(`/umrahs/${id}/pilgrim/contact-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowContactInfoModal(false)
            toast.success(t({ en: 'Contact & identification updated successfully', bn: 'যোগাযোগ এবং পরিচয় সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update contact & identification', bn: 'যোগাযোগ এবং পরিচয় আপডেট করতে ব্যর্থ' }))
        }
    })

    const updateAvatarMutation = useMutation({
        mutationFn: (formData) => api.post(`/umrahs/${id}/pilgrim/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowAvatarModal(false)
            toast.success(t({ en: 'Avatar updated successfully', bn: 'অ্যাভাটার সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update avatar', bn: 'অ্যাভাটার আপডেট করতে ব্যর্থ' }))
        }
    })

    const updateAddressMutation = useMutation({
        mutationFn: (data) => api.put(`/umrahs/${id}/pilgrim/addresses`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowAddressModal(false)
            toast.success(t({ en: 'Addresses updated successfully', bn: 'ঠিকানা সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update addresses', bn: 'ঠিকানা আপডেট করতে ব্যর্থ' }))
        }
    })

    // Status actions
    const markAsCanceledMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowConfirmCancel(false)
            toast.success(t({ en: 'Umrah marked as canceled', bn: 'উমরাহ বাতিল হিসেবে চিহ্নিত করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to cancel umrah', bn: 'উমরাহ বাতিল করতে ব্যর্থ' }))
        }
    })

    const markAsCompletedMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowConfirmComplete(false)
            toast.success(t({ en: 'Umrah marked as completed', bn: 'উমরাহ সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to complete umrah', bn: 'উমরাহ সম্পন্ন করতে ব্যর্থ' }))
        }
    })

    const restoreMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowConfirmRestore(false)
            toast.success(t({ en: 'Umrah restored successfully', bn: 'উমরাহ সফলভাবে পুনরুদ্ধার করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to restore umrah', bn: 'উমরাহ পুনরুদ্ধার করতে ব্যর্থ' }))
        }
    })

    const applyDiscountMutation = useMutation({
        mutationFn: (data) => api.post(`/umrahs/${id}/discount`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimType, id] })
            setShowDiscountModal(false)
            setDiscountAmount('')
            toast.success(t({ en: 'Discount applied successfully', bn: 'ডিসকাউন্ট সফলভাবে প্রয়োগ করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to apply discount', bn: 'ডিসকাউন্ট প্রয়োগ করতে ব্যর্থ' }))
        }
    })

    // Fetch transactions
    const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['umrah-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/umrahs/${id}/transactions`, {
                params: { page: currentPage, per_page: rowsPerPage }
            })
            return response.data
        },
        enabled: !!id
    })

    const transactions = transactionsData?.data || []
    const transactionsMeta = transactionsData?.meta

    const handlePassportSubmit = (formData) => {
        if (editingPassport) {
            updatePassportMutation.mutate(formData)
        } else {
            addPassportMutation.mutate(formData)
        }
    }

    const handleAddPassport = () => {
        setEditingPassport(null)
        setShowPassportModal(true)
    }

    const handleEditPassport = () => {
        if (pilgrim?.passports?.[0]) {
            setEditingPassport(pilgrim.passports[0])
            setShowPassportModal(true)
        }
    }

    const user = pilgrim.pilgrim?.user || pilgrim.user
    const groupLeader = pilgrim.group_leader
    const packageData = pilgrim.package
    const passports = pilgrim.passports || []
    const presentAddress = user?.present_address
    const permanentAddress = user?.permanent_address

    const statusColors = {
        registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
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


    const data = pilgrimData?.data?.relationships || {};
    const userInfo = data?.pilgrim?.relationships?.user || {};


    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <PilgrimProfileCard
                user={userInfo}
                pilgrim={pilgrim}
                pilgrimType={pilgrimType}
                groupLeader={groupLeader}
                packageData={packageData}
                passport={passports?.[0]}
                status={pilgrim.status}
                statusColors={statusColors}
                financialData={{
                    totalCollect: pilgrim.total_collected || pilgrim.totalCollect,
                    totalRefund: pilgrim.total_refunded || pilgrim.totalRefund,
                    discount: pilgrim.discount,
                    dueAmount: pilgrim.due_amount || pilgrim.dueAmount
                }}
                onAvatarEdit={() => setShowAvatarModal(true)}
                onPassportView={handleOpenPassportDialog}
                onStatusComplete={() => setShowConfirmComplete(true)}
                onStatusCancel={() => setShowConfirmCancel(true)}
                onStatusRestore={() => setShowConfirmRestore(true)}
                onDiscountApply={() => setShowDiscountModal(true)}
                mutations={{
                    markAsCompletedMutation,
                    markAsCanceledMutation,
                    restoreMutation
                }}
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
                                    {t({ en: 'Umrah Package', bn: 'উমরাহ প্যাকেজ' })}
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
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAddPassport}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t({ en: 'Add Passport', bn: 'পাসপোর্ট যোগ' })}
                                </Button>
                                {passports.length > 0 && (
                                    <Button size="sm" variant="outline" onClick={handleEditPassport}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t({ en: 'Edit Passport', bn: 'পাসপোর্ট সম্পাদনা' })}
                                    </Button>
                                )}
                            </div>
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
                                        {t({ en: 'No passports added yet', bn: 'কোন পাসপোর্ট যোগ করা হয়নি' })}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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

            {/* Modals */}
            {showPassportModal && (
                <PassportModal
                    isOpen={showPassportModal}
                    onClose={() => setShowPassportModal(false)}
                    onSubmit={handlePassportSubmit}
                    editingPassport={editingPassport}
                    timestamp={passportTimestamp}
                />
            )}

            {showPersonalInfoModal && (
                <EditPersonalInfoModal
                    isOpen={showPersonalInfoModal}
                    onClose={() => setShowPersonalInfoModal(false)}
                    onSubmit={updatePersonalInfoMutation.mutate}
                    pilgrim={user}
                />
            )}

            {showContactInfoModal && (
                <EditContactInfoModal
                    isOpen={showContactInfoModal}
                    onClose={() => setShowContactInfoModal(false)}
                    onSubmit={updateContactInfoMutation.mutate}
                    pilgrim={user}
                />
            )}

            {showAvatarModal && (
                <EditAvatarModal
                    isOpen={showAvatarModal}
                    onClose={() => setShowAvatarModal(false)}
                    onSubmit={updateAvatarMutation.mutate}
                    currentAvatar={user?.avatar}
                />
            )}

            {showAddressModal && (
                <EditAddressModal
                    isOpen={showAddressModal}
                    onClose={() => setShowAddressModal(false)}
                    onSubmit={updateAddressMutation.mutate}
                    presentAddress={presentAddress}
                    permanentAddress={permanentAddress}
                />
            )}

            {/* Status Action Dialogs */}
            <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t({ en: 'Cancel Umrah', bn: 'উমরাহ বাতিল' })}</DialogTitle>
                    </DialogHeader>
                    <p>{t({ en: 'Are you sure you want to cancel this umrah?', bn: 'আপনি কি এই উমরাহ বাতিল করতে চান?' })}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmCancel(false)}>
                            {t({ en: 'Cancel', bn: 'বাতিল' })}
                        </Button>
                        <Button variant="destructive" onClick={() => markAsCanceledMutation.mutate()}>
                            {t({ en: 'Confirm', bn: 'নিশ্চিত' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t({ en: 'Complete Umrah', bn: 'উমরাহ সম্পন্ন' })}</DialogTitle>
                    </DialogHeader>
                    <p>{t({ en: 'Are you sure you want to mark this umrah as completed?', bn: 'আপনি কি এই উমরাহ সম্পন্ন হিসেবে চিহ্নিত করতে চান?' })}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmComplete(false)}>
                            {t({ en: 'Cancel', bn: 'বাতিল' })}
                        </Button>
                        <Button variant="default" onClick={() => markAsCompletedMutation.mutate()}>
                            {t({ en: 'Confirm', bn: 'নিশ্চিত' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showConfirmRestore} onOpenChange={setShowConfirmRestore}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t({ en: 'Restore Umrah', bn: 'উমরাহ পুনরুদ্ধার' })}</DialogTitle>
                    </DialogHeader>
                    <p>{t({ en: 'Are you sure you want to restore this umrah?', bn: 'আপনি কি এই উমরাহ পুনরুদ্ধার করতে চান?' })}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmRestore(false)}>
                            {t({ en: 'Cancel', bn: 'বাতিল' })}
                        </Button>
                        <Button variant="default" onClick={() => restoreMutation.mutate()}>
                            {t({ en: 'Confirm', bn: 'নিশ্চিত' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t({ en: 'Apply Discount', bn: 'ডিসকাউন্ট প্রয়োগ' })}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="discount">{t({ en: 'Discount Amount', bn: 'ডিসকাউন্ট পরিমাণ' })}</Label>
                            <Input
                                id="discount"
                                type="number"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                placeholder="Enter discount amount"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDiscountModal(false)}>
                            {t({ en: 'Cancel', bn: 'বাতিল' })}
                        </Button>
                        <Button onClick={() => applyDiscountMutation.mutate({ discount_amount: discountAmount })}>
                            {t({ en: 'Apply', bn: 'প্রয়োগ' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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