import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    User,
    Phone,
    Mail,
    Edit,
    EllipsisVertical,
    Image,
    Check,
    XCircle,
    RotateCw,
    Percent,
    Users
} from 'lucide-react'

export function PilgrimProfileCard({
    user,
    pilgrim,
    pilgrimType,
    groupLeader,
    packageData,
    passport,
    status,
    statusColors,
    financialData,
    onAvatarEdit,
    onPassportView,
    onStatusComplete,
    onStatusCancel,
    onStatusRestore,
    onDiscountApply,
    mutations = {}
}) {
    const { t, language } = useI18n()

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : ''
        const last = lastName ? lastName.charAt(0).toUpperCase() : ''
        return `${first}${last}`
    }

    const getStatusBadge = () => {
        if (!status) return null

        switch (pilgrimType) {
            case 'umrah':
                return (
                    <Badge className={`capitalize text-xs px-3 py-1 ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status}
                    </Badge>
                )
            case 'pre-registration':
                return <Badge variant="secondary">{t({ en: 'Pre-Registered', bn: 'প্রি-রেজিস্টার্ড' })}</Badge>
            case 'registration':
                return <Badge variant="default">{t({ en: 'Hajj Registered', bn: 'হজ রেজিস্টার্ড' })}</Badge>
            default:
                return null
        }
    }

    const renderActionMenu = () => {
        if (pilgrimType !== 'umrah') return null

        // Hide menu if completed and no passport
        if (status === 'completed' && !passport) return null

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* When registered: Complete + Cancel + Apply Discount */}
                    {status === 'registered' && (
                        <>
                            <DropdownMenuItem
                                onClick={onStatusComplete}
                                disabled={mutations.markAsCompletedMutation?.isPending}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4 text-green-600" />
                                <span className={language === 'bn' ? 'font-bengali' : ''}>
                                    {t({ en: 'Completed', bn: 'সম্পন্ন' })}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onStatusCancel}
                                className="text-destructive gap-2"
                                disabled={mutations.markAsCanceledMutation?.isPending}
                            >
                                <XCircle className="h-4 w-4" />
                                <span className={language === 'bn' ? 'font-bengali' : ''}>
                                    {t({ en: 'Cancel', bn: 'বাতিল' })}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDiscountApply} className="gap-2">
                                <Percent className="h-4 w-4 text-blue-600" />
                                <span className={language === 'bn' ? 'font-bengali' : ''}>
                                    {t({ en: 'Discount', bn: 'ডিসকাউন্ট' })}
                                </span>
                            </DropdownMenuItem>
                        </>
                    )}

                    {/* When cancelled: Restore */}
                    {status === 'cancelled' && (
                        <DropdownMenuItem
                            onClick={onStatusRestore}
                            disabled={mutations.restoreMutation?.isPending}
                            className="gap-2"
                        >
                            <RotateCw className="h-4 w-4" />
                            <span className={language === 'bn' ? 'font-bengali' : ''}>
                                {t({ en: 'Restore Umrah', bn: 'উমরাহ পুনরুদ্ধার করুন' })}
                            </span>
                        </DropdownMenuItem>
                    )}

                    {/* Always available: View Passports (if any) */}
                    {passport && (
                        <DropdownMenuItem onClick={onPassportView} className="gap-2">
                            <Image className="h-4 w-4" />
                            <span className={language === 'bn' ? 'font-bengali' : ''}>
                                {t({ en: 'View Passport', bn: 'পাসপোর্ট দেখুন' })}
                            </span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
console.log('PilgrimProfileCard user:', user);
    return (
        <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t({ en: "Profile", bn: "প্রোফাইল" })}
                </CardTitle>

                {renderActionMenu()}
            </CardHeader>

            <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                            <AvatarImage src={user?.attributes?.avatar} alt={user?.attributes?.fullName} />
                            <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/5">
                                {getInitials(user?.attributes?.firstName, user?.attributes?.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        {onAvatarEdit && (
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={onAvatarEdit}
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                            >
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {user?.name || user?.fullName || 'N/A'}
                            </h2>
                            {user?.fullNameBangla && (
                                <p className="text-lg text-muted-foreground">{user.fullNameBangla}</p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {user?.phone && (
                                <Badge variant="secondary" className="gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                </Badge>
                            )}
                            {user?.email && (
                                <Badge variant="secondary" className="gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </Badge>
                            )}
                            {user?.gender && (
                                <Badge variant="outline" className="capitalize">
                                    {user.gender}
                                </Badge>
                            )}
                            {getStatusBadge()}
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 shrink-0 items-stretch">
                        {packageData && (
                            <div className="text-right space-y-1 p-2 rounded-lg border bg-card flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Package</p>
                                    <p className="text-sm font-semibold">{packageData.name}</p>
                                </div>
                                {packageData.price && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Price</p>
                                        <p className="text-sm font-bold text-primary">
                                            ৳{parseFloat(packageData.price).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {financialData && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-right space-y-1 p-2 rounded-md border bg-card">
                                    <p className="text-[10px] text-muted-foreground">
                                        {t({ en: 'Collected', bn: 'সংগৃহীত' })}
                                    </p>
                                    <p className="text-sm font-bold text-green-600">
                                        ৳{parseFloat(financialData.totalCollect || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right space-y-1 p-2 rounded-md border bg-card">
                                    <p className="text-[10px] text-muted-foreground">
                                        {t({ en: 'Refunded', bn: 'ফেরত' })}
                                    </p>
                                    <p className="text-sm font-bold text-red-600">
                                        ৳{parseFloat(financialData.totalRefund || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right space-y-1 p-2 rounded-md border bg-card">
                                    <p className="text-[10px] text-muted-foreground">
                                        {t({ en: 'Discount', bn: 'ডিসকাউন্ট' })}
                                    </p>
                                    <p className="text-sm font-bold text-blue-600">
                                        ৳{parseFloat(financialData.discount || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right space-y-1 p-2 rounded-md border bg-card">
                                    <p className="text-[10px] text-muted-foreground">
                                        {t({ en: 'Due', bn: 'বাকি' })}
                                    </p>
                                    <p className={`text-sm font-bold ${parseFloat(financialData.dueAmount || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        ৳{parseFloat(financialData.dueAmount || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}